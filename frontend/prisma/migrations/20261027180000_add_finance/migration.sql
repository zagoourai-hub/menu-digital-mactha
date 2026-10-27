ALTER TABLE "Order" ADD COLUMN "paymentEnvironment" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "countsAsCup" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX "PaymentEvent_status_createdAt_idx" ON "PaymentEvent"("status", "createdAt");
CREATE TABLE "CashEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "environment" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "occurredOn" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "cups" INTEGER NOT NULL DEFAULT 0,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdByName" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "cancelled" BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX "CashEntry_environment_occurredOn_idx" ON "CashEntry"("environment", "occurredOn");
CREATE TABLE "CashEntryAudit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "entryId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "actorName" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "beforeJson" TEXT NOT NULL,
  "afterJson" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CashEntryAudit_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CashEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "CashEntryAudit_entryId_createdAt_idx" ON "CashEntryAudit"("entryId", "createdAt");
