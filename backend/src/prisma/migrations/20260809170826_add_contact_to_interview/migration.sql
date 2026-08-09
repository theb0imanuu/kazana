-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "contactId" UUID;

-- CreateIndex
CREATE INDEX "interviews_contactId_idx" ON "interviews"("contactId");

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
