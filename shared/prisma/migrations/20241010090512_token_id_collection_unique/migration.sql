/*
  Warnings:

  - A unique constraint covering the columns `[tokenId,collectionId]` on the table `NFTAsset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NFTAsset_tokenId_collectionId_key" ON "NFTAsset"("tokenId", "collectionId");
