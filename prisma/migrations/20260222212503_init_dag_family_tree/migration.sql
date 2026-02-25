/*
  Warnings:

  - You are about to drop the column `fatherId` on the `FamilyMember` table. All the data in the column will be lost.
  - You are about to drop the column `motherId` on the `FamilyMember` table. All the data in the column will be lost.
  - You are about to drop the column `spouseId` on the `FamilyMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[linkedUserId]` on the table `FamilyMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('PARENT_CHILD', 'SPOUSE', 'ADOPTION', 'DIVORCED_SPOUSE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- DropForeignKey
ALTER TABLE "FamilyMember" DROP CONSTRAINT "FamilyMember_fatherId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyMember" DROP CONSTRAINT "FamilyMember_motherId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyMember" DROP CONSTRAINT "FamilyMember_spouseId_fkey";

-- AlterTable
ALTER TABLE "FamilyMember" DROP COLUMN "fatherId",
DROP COLUMN "motherId",
DROP COLUMN "spouseId",
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "linkedUserId" TEXT,
ADD COLUMN     "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'SINGLE',
ADD COLUMN     "profession" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isResidentOfTuminDhanbari" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "FamilyEdge" (
    "id" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "type" "EdgeType" NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "addedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FamilyEdge_fromNodeId_idx" ON "FamilyEdge"("fromNodeId");

-- CreateIndex
CREATE INDEX "FamilyEdge_toNodeId_idx" ON "FamilyEdge"("toNodeId");

-- CreateIndex
CREATE INDEX "FamilyEdge_isApproved_idx" ON "FamilyEdge"("isApproved");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyEdge_fromNodeId_toNodeId_type_key" ON "FamilyEdge"("fromNodeId", "toNodeId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_linkedUserId_key" ON "FamilyMember"("linkedUserId");

-- CreateIndex
CREATE INDEX "FamilyMember_linkedUserId_idx" ON "FamilyMember"("linkedUserId");

-- AddForeignKey
ALTER TABLE "FamilyEdge" ADD CONSTRAINT "FamilyEdge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "FamilyMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyEdge" ADD CONSTRAINT "FamilyEdge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "FamilyMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyEdge" ADD CONSTRAINT "FamilyEdge_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
