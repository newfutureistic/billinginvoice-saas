import { test } from 'node:test'
import assert from 'node:assert/strict'
import { percentChange } from '@/lib/dto/dashboard.dto'

test('percentChange: normal deltas', () => {
  assert.equal(percentChange(120, 100), 20)
  assert.equal(percentChange(50, 100), -50)
  assert.equal(percentChange(100, 100), 0)
})

test('percentChange: empty previous period', () => {
  assert.equal(percentChange(0, 0), 0)
  assert.equal(percentChange(500, 0), 100)
})

test('percentChange: rounds to one decimal place', () => {
  assert.equal(percentChange(1, 3), -66.7)
  assert.equal(percentChange(2, 3), -33.3)
})
