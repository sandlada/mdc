/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/** Canonical site origin. Mirrors `site` in `astro.config.mjs`. */
export const SITE_URL = 'https://mdc.sandlada.com'
export const SITE_NAME = 'MDC by Sandlada'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/mdc-cover.png`
export const DEFAULT_OG_IMAGE_WIDTH = 1280
export const DEFAULT_OG_IMAGE_HEIGHT = 640
export const DEFAULT_TWITTER_CARD = 'summary_large_image'
export const DEFAULT_ROBOTS = 'index, follow'

export interface SeoInput {
    title: string
    description: string
    /** Path starting with `/`, e.g. `/components/button/`. Defaults to `/`. */
    path?: string
    keywords?: string[]
    /** Defaults to {@link DEFAULT_ROBOTS}. Set to `noindex, nofollow` for thin pages. */
    robots?: string
    /** `website` for top-level pages, `article` for component docs. */
    ogType?: 'website' | 'article'
    ogImage?: string
    twitterCard?: string
}

export interface ResolvedSeo extends Required<Omit<SeoInput, 'keywords'>> {
    keywords: string[]
    canonical: string
}

/** Join the site origin with a path to form a canonical URL. */
export function canonicalUrl(path = '/'): string {
    const normalized = path.startsWith('/') ? path : `/${path}`
    const withSlash = normalized.endsWith('/') ? normalized : `${normalized}/`
    return `${SITE_URL}${withSlash === '//' ? '/' : withSlash}`
}

/** Resolve page-level SEO input against site-wide defaults. */
export function resolveSeo(input: SeoInput): ResolvedSeo {
    const path = input.path ?? '/'
    return {
        title: input.title,
        description: input.description,
        path,
        canonical: canonicalUrl(path),
        robots: input.robots ?? DEFAULT_ROBOTS,
        ogType: input.ogType ?? 'website',
        ogImage: input.ogImage ?? DEFAULT_OG_IMAGE,
        twitterCard: input.twitterCard ?? DEFAULT_TWITTER_CARD,
        keywords: input.keywords ?? [],
    }
}

/** Strip tags from rendered README HTML and return the first meaningful paragraph. */
export function excerptFromHtml(html: string, maxLength = 160): string | undefined {
    const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    if (!text) return undefined
    // Skip table-of-contents style fragments; prefer the first sentence-like chunk.
    const sentence = text.split(/(?<=[.!?])\s+/)[0] ?? text
    const excerpt = sentence.length > maxLength ? `${sentence.slice(0, maxLength - 1).trimEnd()}…` : sentence
    return excerpt || undefined
}

/** Build a unique, indexable description for a component page. */
export function componentDescription(label: string, tag: string, excerpt?: string, demoCount = 0): string {
    const base = `${label} component (<${tag}>) — Material Design 3 web component in @sandlada/mdc.`
    const middle = excerpt ? ` ${excerpt}` : ` Framework-agnostic custom element for React, Vue, Angular, Svelte, and plain HTML.`
    const tail = demoCount > 0 ? ` Explore ${demoCount} live ${label} demo${demoCount === 1 ? '' : 's'}, API reference, and usage examples.` : ' Explore live demos, API reference, and usage examples.'
    const full = `${base}${middle}${tail}`.replace(/\s+/g, ' ').trim()
    return full.length > 160 ? `${full.slice(0, 159).trimEnd()}…` : full
}

/** Breadcrumb JSON-LD shared by docs pages. */
export function breadcrumbJsonLd(trail: Array<{ name: string; path: string }>): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: canonicalUrl(item.path),
        })),
    }
}
