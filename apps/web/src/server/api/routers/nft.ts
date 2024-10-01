import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { fetchUserNFTs } from '~/app/api/nftService';

export const nftRouter = createTRPCRouter({
  getUserNFTs: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      try {
        const nfts = await fetchUserNFTs(input.userId);
        if (nfts.length === 0) {
          return { message: 'No NFTs found for this user', nfts: [] };
        }
        return { nfts };
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        throw new Error(`Failed to fetch NFTs: ${error.message}`);
      }
    })
});