import type { Client, Prisma } from '@prisma/client'
import { TenantCrudService } from '@/server/services/crud.service'
import {
  ClientRepository,
  CLIENT_SORTABLE,
  type ClientCreateData,
  type ClientFilter,
} from '@/server/repositories/client.repository'
import {
  clientCreateSchema,
  clientUpdateSchema,
  type ClientCreateInput,
  type ClientUpdateInput,
} from '@/lib/validation/client.schema'
import { toClientDTO, type ClientOutputDTO } from '@/lib/dto/client.dto'
import { TenantRequiredError } from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

/**
 * Client CRUD (Mission 5 §2). Inherits validated, tenant-scoped, audited + timeline-logged
 * create/list/update/soft-delete/restore/permanent-delete/deleted-listing from
 * {@link TenantCrudService}; adds only the mapping between the Zod input and the repository.
 */
export class ClientService extends TenantCrudService<
  Client,
  ClientOutputDTO,
  ClientCreateInput,
  ClientUpdateInput,
  ClientCreateData,
  Prisma.ClientUpdateInput,
  ClientFilter
> {
  protected readonly repo: ClientRepository
  protected readonly createSchema = clientCreateSchema
  protected readonly updateSchema = clientUpdateSchema
  protected readonly resource = 'Client'
  protected readonly sortable = CLIENT_SORTABLE

  constructor(ctx: RequestContext) {
    super(ctx)
    if (!ctx.workspaceId) throw new TenantRequiredError()
    this.repo = new ClientRepository(ctx.workspaceId)
  }

  protected toDTO(model: Client): ClientOutputDTO {
    return toClientDTO(model)
  }

  protected toCreateData(input: ClientCreateInput): ClientCreateData {
    return {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      taxId: input.taxId ?? null,
      status: input.status,
    }
  }

  protected toUpdateData(input: ClientUpdateInput): Prisma.ClientUpdateInput {
    return input
  }

  protected entityId(model: Client): string {
    return model.id
  }

  protected entityLabel(model: Client): string {
    return model.name
  }
}
