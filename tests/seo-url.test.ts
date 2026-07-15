import { test } from 'node:test'
import assert from 'node:assert/strict'

/**
 * `app/layout.tsx` does `new URL(SITE.url)` at module scope, so a malformed APP_URL/AUTH_URL
 * aborted the whole production build with an opaque ERR_INVALID_URL naming no variable.
 * SITE is computed at import time, so each case re-imports the module with a fresh env.
 */
const ENV_KEYS = ['NEXT_PUBLIC_SITE_URL', 'APP_URL', 'AUTH_URL'] as const

async function siteUrlWith(env: Partial<Record<(typeof ENV_KEYS)[number], string>>): Promise<string> {
  const saved: Record<string, string | undefined> = {}
  for (const k of ENV_KEYS) {
    saved[k] = process.env[k]
    delete process.env[k]
  }
  Object.assign(process.env, env)
  try {
    // cache-bust so the module re-evaluates against the new env
    const mod = await import(`@/lib/seo?case=${Math.random()}`)
    return mod.SITE.url
  } finally {
    for (const k of ENV_KEYS) {
      delete process.env[k]
      if (saved[k] !== undefined) process.env[k] = saved[k]
    }
  }
}

test('seo: a proper https URL is used as-is', async () => {
  assert.equal(await siteUrlWith({ APP_URL: 'https://bill-maker.com' }), 'https://bill-maker.com')
})

test('seo: a bare host (missing protocol) is normalised to https, not a crash', async () => {
  // This is exactly what broke the Netlify build.
  assert.equal(await siteUrlWith({ APP_URL: 'bill-maker.com' }), 'https://bill-maker.com')
  assert.equal(await siteUrlWith({ APP_URL: 'my-site.netlify.app' }), 'https://my-site.netlify.app')
})

test('seo: a trailing slash is stripped', async () => {
  assert.equal(await siteUrlWith({ APP_URL: 'https://bill-maker.com/' }), 'https://bill-maker.com')
})

test('seo: unset env falls back to the production domain', async () => {
  assert.equal(await siteUrlWith({}), 'https://bill-maker.com')
})

test('seo: precedence NEXT_PUBLIC_SITE_URL > APP_URL > AUTH_URL', async () => {
  assert.equal(
    await siteUrlWith({ NEXT_PUBLIC_SITE_URL: 'https://a.com', APP_URL: 'https://b.com', AUTH_URL: 'https://c.com' }),
    'https://a.com',
  )
  assert.equal(await siteUrlWith({ APP_URL: 'https://b.com', AUTH_URL: 'https://c.com' }), 'https://b.com')
  assert.equal(await siteUrlWith({ AUTH_URL: 'https://c.com' }), 'https://c.com')
})

test('seo: SITE.url is ALWAYS constructible by new URL() — the build must never throw', async () => {
  for (const v of ['bill-maker.com', 'https://x.com', 'http://x.com/', '   ', 'not a url', '://bad', 'ftp://x.com']) {
    const url = await siteUrlWith({ APP_URL: v })
    assert.doesNotThrow(() => new URL(url), `new URL() must not throw for APP_URL=${JSON.stringify(v)}`)
  }
})
