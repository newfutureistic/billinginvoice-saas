import { Prisma, type User } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'
import { NotFoundError } from '@/server/db/errors'

/** Fields required to create a credentials or OAuth user. */
export interface UserCreateData {
  email: string
  name?: string | null
  passwordHash?: string | null
  image?: string | null
  emailVerified?: Date | null
  timezone?: string
}

/**
 * User (identity) repository. Unlike the tenant repositories, users are global
 * identities keyed by email, so this extends {@link BaseRepository} directly. Email is
 * always normalized to lowercase to make lookups and the unique constraint reliable.
 */
export class UserRepository extends BaseRepository {
  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
  }

  findById(id: string): Promise<User | null> {
    return this.run(() => this.db.user.findUnique({ where: { id } }))
  }

  findByEmail(email: string): Promise<User | null> {
    return this.run(() =>
      this.db.user.findUnique({ where: { email: UserRepository.normalizeEmail(email) } }),
    )
  }

  async requireById(id: string): Promise<User> {
    const user = await this.findById(id)
    if (!user) throw new NotFoundError('User', { id })
    return user
  }

  create(data: UserCreateData): Promise<User> {
    const input: Prisma.UserUncheckedCreateInput = {
      email: UserRepository.normalizeEmail(data.email),
      name: data.name ?? null,
      passwordHash: data.passwordHash ?? null,
      image: data.image ?? null,
      emailVerified: data.emailVerified ?? null,
      ...(data.timezone ? { timezone: data.timezone } : {}),
    }
    return this.run(() => this.db.user.create({ data: input }))
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.run(() => this.db.user.update({ where: { id }, data }))
  }

  setPasswordHash(id: string, passwordHash: string): Promise<User> {
    return this.run(() => this.db.user.update({ where: { id }, data: { passwordHash } }))
  }

  markEmailVerified(id: string, when: Date = new Date()): Promise<User> {
    return this.run(() => this.db.user.update({ where: { id }, data: { emailVerified: when } }))
  }

  /** Whether an account already exists for this email (case-insensitive). */
  async emailExists(email: string): Promise<boolean> {
    return (await this.findByEmail(email)) !== null
  }
}
