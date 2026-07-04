// Keep bcrypt fast for tests (cost read lazily on first hash).
process.env.BCRYPT_COST = '10'

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword, needsRehash } from '@/server/auth/password'
import {
  hashToken,
  verifyTokenHash,
  safeEqual,
  generateNumericCode,
  generateToken,
  tokenIdentifier,
  TokenPurpose,
} from '@/server/auth/tokens'

test('hashPassword / verifyPassword round-trip', async () => {
  const hash = await hashPassword('S3curePass!')
  assert.match(hash, /^\$2[aby]\$\d{2}\$/)
  assert.equal(await verifyPassword('S3curePass!', hash), true)
  assert.equal(await verifyPassword('wrong', hash), false)
  assert.equal(await verifyPassword('anything', null), false)
})

test('needsRehash detects weaker/foreign hashes', () => {
  assert.equal(needsRehash('$2b$08$abcdefghijklmnopqrstuuAbCdEfGhIjKlMnOpQrStUvWx'), true)
  assert.equal(needsRehash('$2b$12$abcdefghijklmnopqrstuuAbCdEfGhIjKlMnOpQrStUvWx'), false)
  assert.equal(needsRehash('not-a-bcrypt-hash'), true)
})

test('token hashing is deterministic + constant-time compare', () => {
  const raw = generateToken()
  const h = hashToken(raw)
  assert.equal(h, hashToken(raw))
  assert.notEqual(h, hashToken(generateToken()))
  assert.equal(verifyTokenHash(raw, h), true)
  assert.equal(verifyTokenHash('tampered', h), false)
  assert.equal(safeEqual('abc', 'abc'), true)
  assert.equal(safeEqual('abc', 'abd'), false)
  assert.equal(safeEqual('abc', 'abcd'), false)
})

test('numeric verification codes are 6 digits, uniform padding', () => {
  for (let i = 0; i < 50; i++) {
    const code = generateNumericCode(6)
    assert.match(code, /^\d{6}$/)
  }
})

test('tokenIdentifier namespaces by purpose + lowercased subject', () => {
  assert.equal(
    tokenIdentifier(TokenPurpose.EMAIL_VERIFY, 'User@Example.com'),
    'email-verify:user@example.com',
  )
  assert.equal(
    tokenIdentifier(TokenPurpose.PASSWORD_RESET, 'a@b.com'),
    'password-reset:a@b.com',
  )
})
