/** Database subsystem barrel. */
export { prisma, disconnectPrisma, type DbClient } from '@/server/db/prisma'
export { runInTransaction, type TransactionOptions, type TransactionClient } from '@/server/db/transaction'
export {
  DatabaseError,
  NotFoundError,
  UniqueConstraintError,
  ForeignKeyError,
  TransactionError,
  ConnectionError,
  isDatabaseError,
  mapPrismaError,
  type DatabaseErrorCode,
} from '@/server/db/errors'
export {
  pingDatabase,
  resolvePagination,
  buildPageMeta,
  withNotDeleted,
  notDeleted,
  isCuid,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type Pagination,
  type PaginationInput,
  type PageMeta,
  type Paginated,
} from '@/server/db/utils'
export { dbLogger, createLogger, type Logger, type LogLevel } from '@/server/db/logger'
