/*
  Warnings:

  - A unique constraint covering the columns `[contractAddress,networkID]` on the table `SmartContract` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SmartContract_contractAddress_networkID_key" ON "SmartContract"("contractAddress", "networkID");
