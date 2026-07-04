/** Utility layer barrel. */
export { decimalToNumber, decimalToNumberOrNull, roundTo, type DecimalLike } from '@/server/utils/decimal'
export {
  toIso,
  parseIso,
  addDays,
  startOfDayUtc,
  daysBetween,
  isPastDue,
  formatDateOnly,
} from '@/server/utils/date'
export {
  CURRENCIES,
  currencyMeta,
  currencySymbol,
  formatCurrency,
  roundMoney,
  type CurrencyMeta,
} from '@/server/utils/currency'
export { calculateTax, taxAmount, type TaxBasis, type TaxResult } from '@/server/utils/tax'
export {
  computeDocumentTotals,
  type DocumentTotals,
  type TotalsItemInput,
  type TotalsTaxInput,
  type TotalsDiscountInput,
  type TotalsShippingInput,
} from '@/server/utils/document-totals'
export {
  formatDocumentNumber,
  renderNumberFormat,
  parseDocumentNumber,
  type NumberParts,
} from '@/server/utils/invoice-number'
export { parseSort, buildOrderBy, type SortDirection, type SortInput } from '@/server/utils/sort'
export { normalizeSearch, containsInsensitive, buildSearchOr } from '@/server/utils/search'
export {
  pruneUndefined,
  parseBoolean,
  parseEnumParam,
  parseIntParam,
} from '@/server/utils/filters'
// Pagination lives in the data layer; re-exported here for a single utility surface.
export {
  resolvePagination,
  buildPageMeta,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type Pagination,
  type PaginationInput,
  type PageMeta,
  type Paginated,
} from '@/server/db/utils'
