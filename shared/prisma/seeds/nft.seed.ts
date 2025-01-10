const projectSeeds = [
  {
    id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', // Example UUID
    name: 'U2U Project',
    apiKeyID: 'apiKey1', // Assuming this ID exists in the APIKey table
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const collectionSeeds = [
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', // Example UUID
    name: 'Art Collection',
    description: 'A collection of unique digital artworks.',
    avatarUrl: 'https://example.com/avatars/art-collection.png',
    projectId: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', // Assuming this ID exists in the Project table
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', // Example UUID
    name: 'Photography Collection',
    description: 'A collection of stunning photographs.',
    avatarUrl: 'https://example.com/avatars/photography-collection.png',
    projectId: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', // Assuming this ID exists in the Project table
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3c4d5e6f-7g8h-9i0j-k1l2-m3n4o5p6q7r', // Example UUID
    name: 'Music Collection',
    description: 'A collection of exclusive music tracks.',
    avatarUrl: 'https://example.com/avatars/music-collection.png',
    projectId: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', // Assuming this ID exists in the Project table
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const nftAssetSeeds = [
  {
    id: '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v', // Example UUID
    name: 'Unique Art Piece',
    tokenId: 1, // Example token ID
    description: 'An exclusive digital artwork.',
    collectionId: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', // Assuming this ID exists in the Collection table
    quantity: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w', // Example UUID
    name: 'Limited Edition Photo',
    tokenId: 2, // Example token ID
    description: 'A limited edition photograph.',
    collectionId: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', // Assuming this ID exists in the Collection table
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '9i0j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x', // Example UUID
    name: 'Exclusive Music Track',
    tokenId: 3, // Example token ID
    description: 'An exclusive track by the artist.',
    collectionId: '3c4d5e6f-7g8h-9i0j-k1l2-m3n4o5p6q7r', // Assuming this ID exists in the Collection table
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export { projectSeeds, collectionSeeds, nftAssetSeeds };
