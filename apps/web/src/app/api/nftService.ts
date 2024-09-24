import { connectToStarknet } from 'starknetkit'; // Adjust based on your blockchain provider

export async function fetchUserNFTs() {
    try {
        const account = await connectToStarknet();
        const nfts = await account.getNFTs(); // This would be a call to fetch the user's NFTs
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