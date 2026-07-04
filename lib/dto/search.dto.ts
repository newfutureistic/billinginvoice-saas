/**
 * Global-search output. Results are normalized across entity types into a single card
 * shape so the frozen command/search UI can render a mixed list uniformly.
 */
export type SearchEntity = 'client' | 'product' | 'document' | 'template'

export interface SearchResultDTO {
  entity: SearchEntity
  id: string
  title: string
  subtitle: string | null
  /** Extra machine-readable hint (status, sku, document type, …). */
  badge: string | null
}

export interface SearchResponseDTO {
  query: string
  total: number
  results: SearchResultDTO[]
  /** Per-entity counts for the grouped UI. */
  counts: Record<SearchEntity, number>
}
