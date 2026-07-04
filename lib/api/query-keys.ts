/**
 * Centralized React Query key factory — one source of truth for cache keys so queries and
 * their mutations invalidate consistently (no ad-hoc string keys scattered across hooks).
 */
export const queryKeys = {
  currentUser: ['current-user'] as const,
  session: ['session'] as const,

  workspaces: ['workspaces'] as const,
  workspaceDetail: ['workspace', 'detail'] as const,
  workspaceSettings: ['workspace', 'settings'] as const,

  dashboard: (months: number) => ['dashboard', months] as const,

  clients: {
    all: ['clients'] as const,
    list: (q?: unknown) => ['clients', 'list', q ?? {}] as const,
    infinite: (q?: unknown) => ['clients', 'infinite', q ?? {}] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
    deleted: (q?: unknown) => ['clients', 'deleted', q ?? {}] as const,
  },
  products: {
    all: ['products'] as const,
    list: (q?: unknown) => ['products', 'list', q ?? {}] as const,
    infinite: (q?: unknown) => ['products', 'infinite', q ?? {}] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    deleted: (q?: unknown) => ['products', 'deleted', q ?? {}] as const,
    categories: ['products', 'categories'] as const,
  },
  documents: {
    all: ['documents'] as const,
    list: (q?: unknown) => ['documents', 'list', q ?? {}] as const,
    infinite: (q?: unknown) => ['documents', 'infinite', q ?? {}] as const,
    detail: (id: string) => ['documents', 'detail', id] as const,
    deleted: (q?: unknown) => ['documents', 'deleted', q ?? {}] as const,
  },
  templates: {
    all: ['templates'] as const,
    list: (q?: unknown) => ['templates', 'list', q ?? {}] as const,
    detail: (id: string) => ['templates', 'detail', id] as const,
    preview: (id: string) => ['templates', 'preview', id] as const,
  },
  members: ['members'] as const,
  activity: (q?: unknown) => ['activity', q ?? {}] as const,
  audit: (q?: unknown) => ['audit', q ?? {}] as const,
  notifications: {
    all: ['notifications'] as const,
    list: (q?: unknown) => ['notifications', 'list', q ?? {}] as const,
    unread: ['notifications', 'unread-count'] as const,
  },
  search: (q: string) => ['search', q] as const,
} as const
