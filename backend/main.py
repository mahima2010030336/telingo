from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import models, schemas, auth
from database import engine, get_db
import pathlib

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="eLingo Telugu Dictionary API", version="1.0.0")


@app.on_event("startup")
def auto_seed():
    """Auto-seed sample Telugu words on first launch."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(models.Word).count() > 0:
            return
        user = models.User(
            name="eLingo Admin", email="admin@elingo.app",
            password_hash=auth.get_password_hash("admin123"),
        )
        db.add(user); db.flush()
        sample = [
            ("\u0c28\u0c2e\u0c38\u0c4d\u0c15\u0c3e\u0c30\u0c02", [
                ("Traditional Telugu greeting meaning Hello or Greetings, used to show respect.",
                 "\u0c28\u0c2e\u0c38\u0c4d\u0c15\u0c3e\u0c30\u0c02, \u0c2e\u0c40\u0c30\u0c41 \u0c0e\u0c32\u0c3e \u0c09\u0c28\u0c4d\u0c28\u0c3e\u0c30\u0c41? (Hello, how are you?)", "Andhra Pradesh"),
                ("A respectful salutation derived from Sanskrit, used across Telugu-speaking regions.",
                 "\u0c2a\u0c46\u0c26\u0c4d\u0c26\u0c32\u0c15\u0c41 \u0c28\u0c2e\u0c38\u0c4d\u0c15\u0c3e\u0c30\u0c02 \u0c1a\u0c47\u0c2f\u0c3e\u0c32\u0c3f.", "Telangana"),
            ]),
            ("\u0c05\u0c2e\u0c4d\u0c2e", [("Mother. The most affectionate Telugu word for one\u2019s mother.", "\u0c05\u0c2e\u0c4d\u0c2e \u0c35\u0c02\u0c1f \u0c1a\u0c47\u0c38\u0c4d\u0c24\u0c4b\u0c02\u0c26\u0c3f. (Mother is cooking.)", "All regions")]),
            ("\u0c28\u0c40\u0c33\u0c4d\u0c33\u0c41", [("Water. Essential liquid for life.", "\u0c28\u0c3e\u0c15\u0c41 \u0c28\u0c40\u0c33\u0c4d\u0c33\u0c41 \u0c15\u0c3e\u0c35\u0c3e\u0c32\u0c3f. (I need water.)", "All regions")]),
            ("\u0c1a\u0c46\u0c1f\u0c4d\u0c1f\u0c41", [("Tree. A large woody plant with branches and leaves.", "\u0c06 \u0c1a\u0c46\u0c1f\u0c4d\u0c1f\u0c41 \u0c1a\u0c3e\u0c32\u0c3e \u0c2a\u0c46\u0c26\u0c4d\u0c26\u0c26\u0c3f. (That tree is very big.)", "All regions")]),
            ("\u0c2a\u0c41\u0c35\u0c4d\u0c35\u0c41", [("Flower. The colorful bloom of a plant.", "\u0c08 \u0c2a\u0c41\u0c35\u0c4d\u0c35\u0c41 \u0c1a\u0c3e\u0c32\u0c3e \u0c05\u0c02\u0c26\u0c02\u0c17\u0c3e \u0c09\u0c02\u0c26\u0c3f. (This flower is very beautiful.)", "All regions")]),
            ("\u0c06\u0c15\u0c3e\u0c36\u0c02", [("Sky. The expanse above the earth.", "\u0c06\u0c15\u0c3e\u0c36\u0c02 \u0c28\u0c40\u0c32\u0c02\u0c17\u0c3e \u0c09\u0c02\u0c26\u0c3f. (The sky is blue.)", "All regions")]),
            ("\u0c38\u0c42\u0c30\u0c4d\u0c2f\u0c41\u0c21\u0c41", [("Sun. The star at the center of our solar system.", "\u0c38\u0c42\u0c30\u0c4d\u0c2f\u0c41\u0c21\u0c41 \u0c24\u0c42\u0c30\u0c4d\u0c2a\u0c41\u0c28 \u0c09\u0c26\u0c2f\u0c3f\u0c38\u0c4d\u0c24\u0c3e\u0c21\u0c41. (The sun rises in the east.)", "All regions")]),
            ("\u0c2a\u0c41\u0c38\u0c4d\u0c24\u0c15\u0c02", [("Book. A written or printed work.", "\u0c28\u0c47\u0c28\u0c41 \u0c2a\u0c41\u0c38\u0c4d\u0c24\u0c15\u0c02 \u0c1a\u0c26\u0c41\u0c35\u0c41\u0c24\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c28\u0c41. (I am reading a book.)", "All regions")]),
        ]
        for word_str, defs in sample:
            word = models.Word(word=word_str, submitted_by=user.id, is_published=True, likes=25)
            db.add(word); db.flush()
            for defn, usage, region in defs:
                db.add(models.Definition(
                    word_id=word.id, definition=defn, usage=usage, region=region,
                    submitted_by=user.id, is_published=True, likes=12,
                ))
        db.commit()
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WORD_PUBLISH_THRESHOLD = 20
DEF_PUBLISH_THRESHOLD = 10


# ─── Helpers ────────────────────────────────────────────────────────────────

def enrich_word(word: models.Word, db: Session, current_user: Optional[models.User] = None) -> dict:
    defs_out = []
    for d in sorted(word.definitions, key=lambda x: x.created_at):
        if not d.is_published:
            continue
        user_vote = None
        if current_user:
            v = db.query(models.DefinitionVote).filter_by(
                user_id=current_user.id, definition_id=d.id
            ).first()
            if v:
                user_vote = v.vote_type
        defs_out.append({
            "id": d.id,
            "definition": d.definition,
            "usage": d.usage,
            "region": d.region,
            "submitted_by": d.submitted_by,
            "author_name": d.author.name if d.author else "Anonymous",
            "likes": d.likes,
            "dislikes": d.dislikes,
            "is_published": d.is_published,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "user_vote": user_vote,
        })

    word_vote = None
    if current_user:
        v = db.query(models.WordVote).filter_by(
            user_id=current_user.id, word_id=word.id
        ).first()
        if v:
            word_vote = v.vote_type

    return {
        "id": word.id,
        "word": word.word,
        "submitted_by": word.submitted_by,
        "author_name": word.author.name if word.author else "Anonymous",
        "likes": word.likes,
        "dislikes": word.dislikes,
        "is_published": word.is_published,
        "created_at": word.created_at.isoformat() if word.created_at else None,
        "definitions": defs_out,
        "user_vote": word_vote,
    }


# ─── Auth ────────────────────────────────────────────────────────────────────

@app.post("/api/auth/register")
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=auth.get_password_hash(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth.create_access_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email,
                 "avatar": user.avatar, "created_at": user.created_at.isoformat()},
    }


@app.post("/api/auth/login")
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth.create_access_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email,
                 "avatar": user.avatar, "created_at": user.created_at.isoformat()},
    }


@app.get("/api/auth/me")
def me(current_user: models.User = Depends(auth.require_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email,
            "avatar": current_user.avatar}


# ─── Words ───────────────────────────────────────────────────────────────────

@app.get("/api/words")
def get_words(
    search: Optional[str] = None,
    letter: Optional[str] = None,
    sort: Optional[str] = "new",
    skip: int = 0,
    limit: int = 20,
    pending: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user),
):
    query = db.query(models.Word)
    if pending:
        query = query.filter(models.Word.is_published == False)
    else:
        query = query.filter(models.Word.is_published == True)

    if search:
        query = query.filter(models.Word.word.ilike(f"%{search}%"))
    if letter:
        query = query.filter(models.Word.word.ilike(f"{letter}%"))
    if sort == "popular":
        query = query.order_by(models.Word.likes.desc())
    else:
        query = query.order_by(models.Word.created_at.desc())

    words = query.offset(skip).limit(limit).all()
    return [enrich_word(w, db, current_user) for w in words]


@app.get("/api/words/{word_id}")
def get_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user),
):
    word = db.query(models.Word).filter(models.Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
    return enrich_word(word, db, current_user)


@app.post("/api/words")
def create_word(
    word_data: schemas.WordCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_user),
):
    existing = db.query(models.Word).filter(
        func.lower(models.Word.word) == func.lower(word_data.word)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This word already exists in eLingo")

    word = models.Word(
        word=word_data.word,
        submitted_by=current_user.id,
        is_published=False,
    )
    db.add(word)
    db.flush()

    definition = models.Definition(
        word_id=word.id,
        definition=word_data.definition,
        usage=word_data.usage,
        region=word_data.region,
        submitted_by=current_user.id,
        is_published=False,
    )
    db.add(definition)
    db.commit()
    db.refresh(word)
    return enrich_word(word, db, current_user)


# ─── Definitions ─────────────────────────────────────────────────────────────

@app.post("/api/words/{word_id}/definitions")
def add_definition(
    word_id: int,
    def_data: schemas.DefinitionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_user),
):
    word = db.query(models.Word).filter(models.Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    definition = models.Definition(
        word_id=word_id,
        definition=def_data.definition,
        usage=def_data.usage,
        region=def_data.region,
        submitted_by=current_user.id,
        is_published=False,
    )
    db.add(definition)
    db.commit()
    db.refresh(definition)
    return {
        "id": definition.id,
        "definition": definition.definition,
        "usage": definition.usage,
        "region": definition.region,
        "author_name": current_user.name,
        "likes": 0,
        "dislikes": 0,
        "is_published": False,
        "message": f"Definition submitted! It needs {DEF_PUBLISH_THRESHOLD} likes to go live.",
    }


# ─── Votes ───────────────────────────────────────────────────────────────────

@app.post("/api/vote/word/{word_id}")
def vote_word(
    word_id: int,
    vote_req: schemas.VoteRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_user),
):
    if vote_req.vote_type not in ("like", "dislike"):
        raise HTTPException(status_code=400, detail="vote_type must be 'like' or 'dislike'")

    word = db.query(models.Word).filter(models.Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    existing = db.query(models.WordVote).filter_by(
        user_id=current_user.id, word_id=word_id
    ).first()

    if existing:
        if existing.vote_type == vote_req.vote_type:
            # Toggle off
            if existing.vote_type == "like":
                word.likes = max(0, word.likes - 1)
            else:
                word.dislikes = max(0, word.dislikes - 1)
            db.delete(existing)
            db.commit()
            return {"likes": word.likes, "dislikes": word.dislikes, "user_vote": None}
        else:
            if existing.vote_type == "like":
                word.likes = max(0, word.likes - 1)
                word.dislikes += 1
            else:
                word.dislikes = max(0, word.dislikes - 1)
                word.likes += 1
            existing.vote_type = vote_req.vote_type
    else:
        db.add(models.WordVote(user_id=current_user.id, word_id=word_id, vote_type=vote_req.vote_type))
        if vote_req.vote_type == "like":
            word.likes += 1
        else:
            word.dislikes += 1

    # Publish when threshold reached
    if not word.is_published and word.likes >= WORD_PUBLISH_THRESHOLD:
        word.is_published = True

    db.commit()
    return {"likes": word.likes, "dislikes": word.dislikes, "user_vote": vote_req.vote_type,
            "just_published": word.is_published}


@app.post("/api/vote/definition/{def_id}")
def vote_definition(
    def_id: int,
    vote_req: schemas.VoteRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_user),
):
    if vote_req.vote_type not in ("like", "dislike"):
        raise HTTPException(status_code=400, detail="vote_type must be 'like' or 'dislike'")

    definition = db.query(models.Definition).filter(models.Definition.id == def_id).first()
    if not definition:
        raise HTTPException(status_code=404, detail="Definition not found")

    existing = db.query(models.DefinitionVote).filter_by(
        user_id=current_user.id, definition_id=def_id
    ).first()

    if existing:
        if existing.vote_type == vote_req.vote_type:
            if existing.vote_type == "like":
                definition.likes = max(0, definition.likes - 1)
            else:
                definition.dislikes = max(0, definition.dislikes - 1)
            db.delete(existing)
            db.commit()
            return {"likes": definition.likes, "dislikes": definition.dislikes, "user_vote": None}
        else:
            if existing.vote_type == "like":
                definition.likes = max(0, definition.likes - 1)
                definition.dislikes += 1
            else:
                definition.dislikes = max(0, definition.dislikes - 1)
                definition.likes += 1
            existing.vote_type = vote_req.vote_type
    else:
        db.add(models.DefinitionVote(user_id=current_user.id, definition_id=def_id, vote_type=vote_req.vote_type))
        if vote_req.vote_type == "like":
            definition.likes += 1
        else:
            definition.dislikes += 1

    # Publish when threshold reached
    just_published = False
    if not definition.is_published and definition.likes >= DEF_PUBLISH_THRESHOLD:
        definition.is_published = True
        just_published = True
        # Also publish parent word if not published
        if not definition.word.is_published:
            definition.word.is_published = True

    db.commit()
    return {"likes": definition.likes, "dislikes": definition.dislikes,
            "user_vote": vote_req.vote_type, "just_published": just_published}


# ─── Flags ───────────────────────────────────────────────────────────────────

@app.post("/api/flag/word/{word_id}")
def flag_word(word_id: int, db: Session = Depends(get_db),
              current_user: models.User = Depends(auth.require_user)):
    word = db.query(models.Word).filter(models.Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
    word.is_flagged = True
    db.commit()
    return {"message": "Word flagged for review"}


@app.post("/api/flag/definition/{def_id}")
def flag_definition(def_id: int, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.require_user)):
    definition = db.query(models.Definition).filter(models.Definition.id == def_id).first()
    if not definition:
        raise HTTPException(status_code=404, detail="Definition not found")
    definition.is_flagged = True
    db.commit()
    return {"message": "Definition flagged for review"}


# ─── Seed ────────────────────────────────────────────────────────────────────

@app.post("/api/seed")
def seed_data(db: Session = Depends(get_db)):
    if db.query(models.Word).count() > 0:
        return {"message": "Already seeded"}

    user = models.User(
        name="eLingo Admin",
        email="admin@elingo.app",
        password_hash=auth.get_password_hash("admin123"),
    )
    db.add(user)
    db.flush()

    sample = [
        ("నమస్కారం", [
            ("Traditional Telugu greeting meaning 'Hello' or 'Greetings', used to show respect.",
             "నమస్కారం, మీరు ఎలా ఉన్నారు? (Hello, how are you?)", "Andhra Pradesh"),
            ("A respectful salutation derived from Sanskrit, used across Telugu-speaking regions.",
             "పెద్దలకు నమస్కారం చేయాలి. (We should greet elders with Namaskaram.)", "Telangana"),
        ]),
        ("అమ్మ", [
            ("Mother. The most affectionate Telugu word for one's mother.",
             "అమ్మ వంట చేస్తోంది. (Mother is cooking.)", "All regions"),
        ]),
        ("నీళ్ళు", [
            ("Water. Essential liquid for life.",
             "నాకు నీళ్ళు కావాలి. (I need water.)", "All regions"),
        ]),
        ("చెట్టు", [
            ("Tree. A large woody plant with branches and leaves.",
             "ఆ చెట్టు చాలా పెద్దది. (That tree is very big.)", "All regions"),
        ]),
        ("పువ్వు", [
            ("Flower. The colorful bloom of a plant.",
             "ఈ పువ్వు చాలా అందంగా ఉంది. (This flower is very beautiful.)", "All regions"),
        ]),
        ("ఆకాశం", [
            ("Sky. The expanse above the earth.",
             "ఆకాశం నీలంగా ఉంది. (The sky is blue.)", "All regions"),
        ]),
        ("సూర్యుడు", [
            ("Sun. The star at the center of our solar system.",
             "సూర్యుడు తూర్పున ఉదయిస్తాడు. (The sun rises in the east.)", "All regions"),
        ]),
        ("చంద్రుడు", [
            ("Moon. The natural satellite of Earth.",
             "చంద్రుడు రాత్రి మెరుస్తాడు. (The moon shines at night.)", "All regions"),
        ]),
        ("పుస్తకం", [
            ("Book. A written or printed work consisting of pages bound together.",
             "నేను పుస్తకం చదువుతున్నాను. (I am reading a book.)", "All regions"),
        ]),
        ("ఇల్లు", [
            ("House or Home. A place where people live.",
             "మా ఇల్లు చాలా పెద్దది. (Our house is very big.)", "All regions"),
        ]),
    ]

    for word_str, defs in sample:
        word = models.Word(
            word=word_str, submitted_by=user.id,
            is_published=True, likes=25
        )
        db.add(word)
        db.flush()
        for defn, usage, region in defs:
            db.add(models.Definition(
                word_id=word.id, definition=defn,
                usage=usage, region=region,
                submitted_by=user.id, is_published=True, likes=12
            ))

    db.commit()
    return {"message": "Sample Telugu data seeded successfully!"}


# ─── Serve React build in production ─────────────────────────────────────────

_frontend_dist = pathlib.Path(__file__).parent.parent / "frontend" / "dist"

if _frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(_frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_react(full_path: str):
        return FileResponse(str(_frontend_dist / "index.html"))


# ─── SEO: robots.txt ─────────────────────────────────────────────────────────

from fastapi.responses import PlainTextResponse, Response
import datetime

@app.get("/robots.txt", response_class=PlainTextResponse)
def robots():
    site = os.getenv("SITE_URL", "https://elingo.vercel.app")
    return f"""User-agent: *
Allow: /
Disallow: /login
Disallow: /signup
Disallow: /add-word
Disallow: /api/

Sitemap: {site}/sitemap.xml
"""

# ─── SEO: sitemap.xml ────────────────────────────────────────────────────────

@app.get("/sitemap.xml")
def sitemap(db: Session = Depends(get_db)):
    site = os.getenv("SITE_URL", "https://elingo.vercel.app")
    words = db.query(models.Word).filter(models.Word.is_published == True).order_by(models.Word.created_at.desc()).all()
    today = datetime.date.today().isoformat()

    urls = [
        f"""  <url>
    <loc>{site}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>{today}</lastmod>
  </url>""",
    ]
    for w in words:
        lastmod = w.created_at.date().isoformat() if w.created_at else today
        urls.append(f"""  <url>
    <loc>{site}/word/{w.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>{lastmod}</lastmod>
  </url>""")

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += '\n'.join(urls)
    xml += '\n</urlset>'
    return Response(content=xml, media_type="application/xml")
