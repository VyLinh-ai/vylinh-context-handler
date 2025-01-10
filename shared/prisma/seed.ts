import { PrismaClient } from '@prisma/client';
import { collectionSeeds, projectSeeds, nftAssetSeeds } from './seeds/nft.seed';

const prisma = new PrismaClient();

async function main() {
  for (const project of projectSeeds) {
    await prisma.project.create({
      data: project,
    });
  }

  for (const collection of collectionSeeds) {
    await prisma.collection.create({
      data: collection,
    });
  }

  for (const nftAsset of nftAssetSeeds) {
    await prisma.nFTAsset.create({
      data: nftAsset,
    });
  }
}
