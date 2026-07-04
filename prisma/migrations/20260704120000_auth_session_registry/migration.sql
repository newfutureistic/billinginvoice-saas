-- Mission 4 — Authentication & Authorization
-- Additive, non-destructive: turns the Auth.js `Session` table into a server-side
-- session registry (revocation / remember-me / audit) keyed by the JWT `sid` claim.
-- The Auth.js Prisma adapter only reads/writes sessionToken/userId/expires, so these
-- new columns (all defaulted or nullable) do not affect adapter behavior.

ALTER TABLE "Session" ADD COLUMN     "rememberMe" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Session" ADD COLUMN     "ip" TEXT;
ALTER TABLE "Session" ADD COLUMN     "userAgent" TEXT;
ALTER TABLE "Session" ADD COLUMN     "revokedAt" TIMESTAMP(3);
ALTER TABLE "Session" ADD COLUMN     "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Session" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Session" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Session_userId_revokedAt_idx" ON "Session"("userId", "revokedAt");
