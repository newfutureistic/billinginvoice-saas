-- Enterprise multi-currency: add AED, SGD, CHF to the Currency enum.
-- Additive and non-destructive; safe to run against a populated database.
-- (Applied directly to the live database via `ALTER TYPE ... ADD VALUE IF NOT EXISTS`.)
ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'AED';
ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'SGD';
ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'CHF';
