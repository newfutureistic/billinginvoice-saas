-- Track every PDF download from the public, no-signup invoice builder (/invoice/new),
-- guest or signed-in, so the site-admin can see them alongside saved-workspace invoices.
CREATE TABLE "InvoiceDownloadLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "invoiceNumber" TEXT,
    "businessName" TEXT,
    "clientName" TEXT,
    "currency" TEXT,
    "total" DECIMAL(14,2),
    "bucket" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "sizeBytes" INTEGER NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceDownloadLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceDownloadLog_createdAt_idx" ON "InvoiceDownloadLog"("createdAt");

-- CreateIndex
CREATE INDEX "InvoiceDownloadLog_userId_idx" ON "InvoiceDownloadLog"("userId");

-- AddForeignKey
ALTER TABLE "InvoiceDownloadLog" ADD CONSTRAINT "InvoiceDownloadLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
