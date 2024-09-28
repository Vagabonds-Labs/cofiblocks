import { connectToStarknet } from 'starknetkit'; // Adjust based on your blockchain provider
import { trpc } from '~/utils/trpc';  // Import the tRPC client

// Use tRPC to fetch NFTs instead of directly from Starknet
export async function fetchUserNFTs(userId: string) {
    try {
        // Fetch NFTs using tRPC
        const nfts = await trpc.nft.getUserNFTs.query({ userId });
        return nfts;
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        throw new Error('Unable to fetch NFTs');
    }
}

// To keep Starknet functionality for other purposes
export async function fetchUserNFTsFromStarknet() {
    try {
        const account = await connectToStarknet();
        const nfts = await account.getNFTs(); // Call to fetch NFTs from Starknet
        return nfts.map(nft => ({
            id: nft.tokenId,
            imageUrl: nft.metadata.image,
            name: nft.metadata.name,
            description: nft.metadata.description,
        }));
    } catch (error) {
        console.error("Error fetching NFTs", error);
        throw error;
    }
}