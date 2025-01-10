-- CreateTable
CREATE TABLE "ConfirmedTX" (
    "id" TEXT NOT NULL,
    "networkID" INTEGER NOT NULL,

    CONSTRAINT "ConfirmedTX_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConfirmedTX" ADD CONSTRAINT "ConfirmedTX_networkID_fkey" FOREIGN KEY ("networkID") REFERENCES "Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
