/*
  Warnings:

  - You are about to drop the column `mood` on the `Feeling` table. All the data in the column will be lost.
  - You are about to drop the column `predominant_feeling` on the `Feeling` table. All the data in the column will be lost.
  - Added the required column `emotion` to the `Feeling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intensity` to the `Feeling` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Emotion" AS ENUM ('JOY', 'SADNESS', 'ANGER', 'FEAR', 'ANXIETY', 'CALM', 'FRUSTRATION', 'SURPRISE', 'NON_SPECIFIC');

-- AlterTable
ALTER TABLE "Feeling" DROP COLUMN "mood",
DROP COLUMN "predominant_feeling",
ADD COLUMN     "emotion" "Emotion" NOT NULL,
ADD COLUMN     "intensity" INTEGER NOT NULL,
ADD COLUMN     "trigger" TEXT;
