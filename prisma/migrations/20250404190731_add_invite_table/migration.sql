-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('ACCEPTED', 'REJECTED', 'PENDING');

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "sent_by" TEXT NOT NULL,
    "sent_to" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "InviteStatus" NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_id_key" ON "Invite"("id");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
