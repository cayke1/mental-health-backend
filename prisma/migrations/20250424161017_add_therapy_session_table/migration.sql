-- CreateTable
CREATE TABLE "TherapySession" (
    "id" SERIAL NOT NULL,
    "professionalPatientId" TEXT NOT NULL,
    "done" BOOLEAN DEFAULT false,
    "confirmed" BOOLEAN DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TherapySession_id_key" ON "TherapySession"("id");

-- AddForeignKey
ALTER TABLE "TherapySession" ADD CONSTRAINT "TherapySession_professionalPatientId_fkey" FOREIGN KEY ("professionalPatientId") REFERENCES "ProfessionalPatient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
