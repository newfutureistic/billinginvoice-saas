import { test } from 'node:test'
import assert from 'node:assert/strict'

import { calculateTax, taxAmount } from '@/server/utils/tax'
import { formatCurrency, roundMoney, currencySymbol } from '@/server/utils/currency'
import {
  formatDocumentNumber,
  renderNumberFormat,
  parseDocumentNumber,
} from '@/server/utils/invoice-number'
import { addDays, daysBetween, isPastDue, formatDateOnly } from '@/server/utils/date'
import { roundTo, decimalToNumber } from '@/server/utils/decimal'
import { parseSort, buildOrderBy } from '@/server/utils/sort'
import { buildSearchOr, normalizeSearch } from '@/server/utils/search'
import { parseBoolean, parseEnumParam, pruneUndefined } from '@/server/utils/filters'
import { resolvePagination, buildPageMeta } from '@/server/db/utils'

test('tax: exclusive adds tax on top', () => {
  const r = calculateTax(100, 10, 'exclusive')
  assert.equal(r.net, 100)
  assert.equal(r.tax, 10)
  assert.equal(r.gross, 110)
})

test('tax: inclusive extracts tax from within', () => {
  const r = calculateTax(110, 10, 'inclusive')
  assert.equal(r.net, 100)
  assert.equal(r.tax, 10)
  assert.equal(r.gross, 110)
})

test('tax: zero rate is a no-op', () => {
  const r = calculateTax(100, 0, 'exclusive')
  assert.equal(r.tax, 0)
  assert.equal(r.gross, 100)
})

test('tax: negative rate throws', () => {
  assert.throws(() => calculateTax(100, -5, 'exclusive'))
})

test('taxAmount computes exclusive portion', () => {
  assert.equal(taxAmount(200, 15), 30)
})

test('currency: symbol + rounding + formatting', () => {
  assert.equal(currencySymbol('USD'), '$')
  assert.equal(roundMoney(1.005, 'USD'), 1.01)
  assert.equal(roundMoney(1000, 'JPY'), 1000)
  assert.ok(formatCurrency(1234.5, 'USD').includes('1,234.50'))
})

test('invoice-number: format / render / parse round trip', () => {
  assert.equal(formatDocumentNumber({ prefix: 'INV', period: '2024', sequence: 1, padding: 3 }), 'INV-2024-001')
  assert.equal(renderNumberFormat('INV-{YYYY}-{SEQ}', { sequence: 7, date: new Date('2024-05-01'), padding: 4 }), 'INV-2024-0007')
  const parsed = parseDocumentNumber('INV-2024-001')
  assert.deepEqual(parsed, { prefix: 'INV', period: '2024', sequence: 1, padding: 3 })
  assert.equal(parseDocumentNumber('not-a-number'), null)
})

test('date: addDays / daysBetween / isPastDue / formatDateOnly', () => {
  const base = new Date('2024-01-01T00:00:00Z')
  assert.equal(formatDateOnly(addDays(base, 30)), '2024-01-31')
  assert.equal(daysBetween(base, addDays(base, 10)), 10)
  assert.equal(isPastDue(new Date('2020-01-01'), base), true)
  assert.equal(isPastDue(addDays(base, 5), base), false)
})

test('decimal: roundTo half-up + decimalToNumber accepts number/string', () => {
  assert.equal(roundTo(2.345, 2), 2.35)
  assert.equal(decimalToNumber(5), 5)
  assert.equal(decimalToNumber('12.50'), 12.5)
})

test('sort: parseSort respects allow-list and directions', () => {
  const allowed = ['date', 'total']
  const fallback = { field: 'date', direction: 'desc' as const }
  assert.deepEqual(parseSort('-total', allowed, fallback), { field: 'total', direction: 'desc' })
  assert.deepEqual(parseSort('total:asc', allowed, fallback), { field: 'total', direction: 'asc' })
  assert.deepEqual(parseSort('unknown', allowed, fallback), fallback)
  assert.deepEqual(buildOrderBy({ field: 'total', direction: 'asc' }), { total: 'asc' })
})

test('search: buildSearchOr + normalizeSearch', () => {
  assert.equal(normalizeSearch('   '), undefined)
  assert.equal(buildSearchOr('', ['name']), undefined)
  const or = buildSearchOr('acme', ['name', 'email'])
  assert.ok(or && or.OR.length === 2)
  assert.deepEqual(or?.OR[0], { name: { contains: 'acme', mode: 'insensitive' } })
})

test('filters: parseBoolean / parseEnumParam / pruneUndefined', () => {
  assert.equal(parseBoolean('true'), true)
  assert.equal(parseBoolean('0'), false)
  assert.equal(parseBoolean('maybe'), undefined)
  assert.equal(parseEnumParam('paid', ['paid', 'draft'] as const), 'paid')
  assert.equal(parseEnumParam('nope', ['paid', 'draft'] as const), undefined)
  assert.deepEqual(pruneUndefined({ a: 1, b: undefined }), { a: 1 })
})

test('pagination: resolvePagination clamps + buildPageMeta', () => {
  assert.deepEqual(resolvePagination({ page: 0, pageSize: 1000 }), { page: 1, pageSize: 100, skip: 0, take: 100 })
  const meta = buildPageMeta(45, 2, 20)
  assert.equal(meta.totalPages, 3)
  assert.equal(meta.hasNext, true)
  assert.equal(meta.hasPrev, true)
})
