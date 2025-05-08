/*
  Warnings:

  - You are about to drop the column `updated_by_id` on the `Document` table. All the data in the column will be lost.
  - The `category` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `type` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MODEL', 'PATIENT_UPLOAD', 'PROFESSIONAL_UPLOAD', 'PATIENT_TO_PROFESSIONAL', 'PROFESSIONAL_TO_PATIENT');

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_updated_by_id_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "updated_by_id",
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "DocumentType" NOT NULL,
ADD COLUMN     "uploaded_by_id" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT;

-- DropEnum
DROP TYPE "DocumentCategory";

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
