import { test } from 'node:test'
import assert from 'node:assert/strict'

import { isWithinMonthlyLimit, currentMonthStart, accessConfig, PLANS } from '@/lib/config/plans'

test('monthly limit: allows creations below the limit (100th passes)', () => {
  // used = number already created this month; the Nth creation is allowed when used = N-1.
  assert.equal(isWithinMonthlyLimit(0, 100), true) // 1st
  assert.equal(isWithinMonthlyLimit(99, 100), true) // 100th
})

test('monthly limit: blocks at and beyond the limit (101st blocked)', () => {
  assert.equal(isWithinMonthlyLimit(100, 100), false) // 101st blocked
  assert.equal(isWithinMonthlyLimit(150, 100), false)
})

test('monthly limit: 0 / negative limit means unlimited (disabled)', () => {
  assert.equal(isWithinMonthlyLimit(9999, 0), true)
  assert.equal(isWithinMonthlyLimit(9999, -1), true)
})

test('currentMonthStart returns the 1st of the month at 00:00 UTC', () => {
  const d = currentMonthStart(new Date('2026-07-10T13:45:00Z'))
  assert.equal(d.toISOString(), '2026-07-01T00:00:00.000Z')
})

test('defaults: guest limit 2, monthly limit 100, billing disabled', () => {
  assert.equal(accessConfig.guestInvoiceLimit, 2)
  assert.equal(accessConfig.monthlyInvoiceLimit, 100)
  assert.equal(accessConfig.billingEnabled, false)
  assert.equal(accessConfig.subscriptionsEnabled, false)
})

test('plan catalogue: FREE available today, PRO/BUSINESS coming soon', () => {
  assert.equal(PLANS.FREE.available, true)
  assert.equal(PLANS.PRO.available, false)
  assert.equal(PLANS.BUSINESS.available, false)
  assert.equal(PLANS.FREE.monthlyInvoiceLimit, 100)
})
