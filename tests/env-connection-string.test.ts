import { test } from 'node:test'
import assert from 'node:assert/strict'

/**
 * The `.env` loader strips surrounding quotes, but a host (Netlify/Vercel/Docker) injects
 * process.env verbatim. Pasting a value straight out of `.env` — quotes included — passed
 * locally and failed the production build with a confusing "must be a postgres(ql)://
 * connection string". getEnv() caches, so each case re-imports with a fresh env.
 */
const KEYS = ['DATABASE_URL', 'DIRECT_URL'] as const

async function envWith(vals: Partial<Record<(typeof KEYS)[number], string>>) {
  const saved: Record<string, string | undefined> = {}
  for (const k of KEYS) {
    saved[k] = process.env[k]
    delete process.env[k]
  }
  Object.assign(process.env, vals)
  try {
    const mod = await import(`@/server/config/env?c=${Math.random()}`)
    return mod.getEnv()
  } finally {
    for (const k of KEYS) {
      delete process.env[k]
      if (saved[k] !== undefined) process.env[k] = saved[k]
    }
  }
}

const URL_OK = 'postgresql://postgres.ref:pw@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'

test('env: a clean connection string is accepted', async () => {
  const e = await envWith({ DATABASE_URL: URL_OK })
  assert.equal(e.DATABASE_URL, URL_OK)
})

test('env: value wrapped in DOUBLE quotes is accepted (the Netlify failure)', async () => {
  // Exactly what happens when .env's DATABASE_URL="postgresql://…" is pasted into a host UI.
  const e = await envWith({ DATABASE_URL: `"${URL_OK}"` })
  assert.equal(e.DATABASE_URL, URL_OK, 'wrapping quotes must be stripped, not rejected')
})

test('env: value wrapped in SINGLE quotes is accepted', async () => {
  const e = await envWith({ DATABASE_URL: `'${URL_OK}'` })
  assert.equal(e.DATABASE_URL, URL_OK)
})

test('env: surrounding whitespace is tolerated', async () => {
  const e = await envWith({ DATABASE_URL: `  ${URL_OK}  ` })
  assert.equal(e.DATABASE_URL, URL_OK)
})

test('env: DIRECT_URL gets the same normalisation', async () => {
  const direct = URL_OK.replace(':6543', ':5432')
  const e = await envWith({ DATABASE_URL: URL_OK, DIRECT_URL: `"${direct}"` })
  assert.equal(e.DIRECT_URL, direct)
})

test('env: a genuinely wrong scheme is still rejected', async () => {
  await assert.rejects(
    () => envWith({ DATABASE_URL: 'mysql://user:pw@host/db' }),
    /postgres\(ql\):\/\/ connection string/,
    'non-postgres URLs must still fail',
  )
})

// NOTE: an *unset* DATABASE_URL cannot be tested here — the loader repopulates it from the
// repo's real .env file. An empty value exercises the same required-check (the loader skips
// keys already present in process.env).
test('env: an empty DATABASE_URL is still rejected', async () => {
  await assert.rejects(() => envWith({ DATABASE_URL: '' }), /DATABASE_URL/)
})

test('env: the error message never leaks the password', async () => {
  try {
    await envWith({ DATABASE_URL: 'mysql://user:SUPERSECRET@host/db' })
    assert.fail('should have thrown')
  } catch (e) {
    assert.ok(!/SUPERSECRET/.test((e as Error).message), 'password must never appear in the error')
  }
})
