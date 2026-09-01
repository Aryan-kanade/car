import { useEffect } from 'react'

const SITE_NAME = 'KMKIRAMYKI'
const DEFAULT_TITLE = 'KMKIRAMYKI Advanced Chemistry — Premium Car Care'
const DEFAULT_DESCRIPTION =
  'pH-balanced detailing chemistry, ceramic-grade protection and studio-tested tools — engineered for the enthusiast who notices every detail.'

function setMeta(attribute, key, content) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/**
 * Per-page document title + description/OG meta.
 * Call once per page component with static values.
 */
export function usePageMeta(title, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    // Canonical URL for the current route (strip hash/query)
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', window.location.origin + window.location.pathname)
    document.title = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', document.title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'website')
  }, [title, description])
}
