from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255))
    avatar = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    words = relationship("Word", back_populates="author", foreign_keys="Word.submitted_by")
    definitions = relationship("Definition", back_populates="author", foreign_keys="Definition.submitted_by")


class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String(200), nullable=False, index=True)
    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    likes = Column(Integer, default=0)
    dislikes = Column(Integer, default=0)
    is_published = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    author = relationship("User", back_populates="words", foreign_keys=[submitted_by])
    definitions = relationship("Definition", back_populates="word", cascade="all, delete-orphan")
    votes = relationship("WordVote", back_populates="word", cascade="all, delete-orphan")


class Definition(Base):
    __tablename__ = "definitions"

    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=False)
    definition = Column(Text, nullable=False)
    usage = Column(Text, nullable=True)
    region = Column(String(100), nullable=True)
    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    likes = Column(Integer, default=0)
    dislikes = Column(Integer, default=0)
    is_published = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    word = relationship("Word", back_populates="definitions")
    author = relationship("User", back_populates="definitions", foreign_keys=[submitted_by])
    votes = relationship("DefinitionVote", back_populates="definition", cascade="all, delete-orphan")


class WordVote(Base):
    __tablename__ = "word_votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=False)
    vote_type = Column(String(10), nullable=False)  # 'like' or 'dislike'

    __table_args__ = (UniqueConstraint("user_id", "word_id", name="unique_word_vote"),)

    user = relationship("User")
    word = relationship("Word", back_populates="votes")


class DefinitionVote(Base):
    __tablename__ = "definition_votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    definition_id = Column(Integer, ForeignKey("definitions.id"), nullable=False)
    vote_type = Column(String(10), nullable=False)  # 'like' or 'dislike'

    __table_args__ = (UniqueConstraint("user_id", "definition_id", name="unique_def_vote"),)

    user = relationship("User")
    definition = relationship("Definition", back_populates="votes")
