-- Payment engine Phase 2: partial-payment status + more payment methods.
-- Additive and non-destructive; safe on a populated database.
ALTER TYPE "DocumentStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_PAID';
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'UPI';
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'CHEQUE';
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'WALLET';
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'NEFT_RTGS';
