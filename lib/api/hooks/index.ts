/**
 * React Query hooks barrel — every frozen page/component imports its data from here.
 * One import surface, one fetch implementation, zero duplicated fetching logic.
 */
export * from '@/lib/api/hooks/use-dashboard'
export * from '@/lib/api/hooks/use-clients'
export * from '@/lib/api/hooks/use-products'
export * from '@/lib/api/hooks/use-documents'
export * from '@/lib/api/hooks/use-templates'
export * from '@/lib/api/hooks/use-workspaces'
export * from '@/lib/api/hooks/use-members'
export * from '@/lib/api/hooks/use-activity'
export * from '@/lib/api/hooks/use-notifications'
export * from '@/lib/api/hooks/use-current-user'
export * from '@/lib/api/hooks/use-session'
export * from '@/lib/api/hooks/use-search'
export * from '@/lib/api/hooks/use-invoice-builder'
export { createResourceHooks } from '@/lib/api/hooks/create-resource-hooks'
