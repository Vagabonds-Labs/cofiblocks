import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { fetchUserNFTs } from '~/app/api/nftService';  // service to fetch from blockchain

export const nftRouter = createTRPCRouter({
  getUserNFTs: publicProcedure
    .input(z.object({ userId: z.string() })) // user-specific NFTs
    .query(async ({ input }) => {
      try {
        const nfts = await fetchUserNFTs(input.userId); // Fetch NFTs from blockchain
        return nfts;
      } catch (error) {
        throw new Error('Failed to fetch NFTs');
      }
    }),
});