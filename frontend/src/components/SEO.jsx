import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'eLingo Telugu Dictionary'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://elingo.vercel.app'
const DEFAULT_DESC = 'eLingo is a free, community-powered Telugu dictionary. Search Telugu words, meanings, definitions, usage examples and regional variations. Add and vote on new words.'
const DEFAULT_IMG = `${SITE_URL}/og-image.png`

export default function SEO({ title, description, url, image, word, definitions = [], type = 'website' }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const desc = description || DEFAULT_DESC
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL
  const img = image || DEFAULT_IMG

  // JSON-LD structured data for dictionary words
  const jsonLd = word ? {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: word,
    description: definitions[0]?.definition || desc,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(definitions.length > 0 && {
      definition: definitions.slice(0, 3).map(d => d.definition).join(' | ')
    })
  } : {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESC,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={`telugu dictionary, telugu words, telugu meanings, ${word || 'elingo'}, telugu language, andhra pradesh, telangana`} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Telugu, English" />
      <meta name="author" content="eLingo" />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={img} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}
