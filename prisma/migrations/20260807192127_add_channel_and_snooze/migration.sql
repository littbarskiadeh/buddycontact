-- AlterTable
ALTER TABLE "Contact" ADD COLUMN "snoozedUntil" DATETIME;

-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN "channel" TEXT;
