'use client'

import { useState, useEffect } from 'react';
import { H1 } from '@repo/ui/typography';
import NftCard from '@repo/ui/nft/NftCard';
import { fetchUserNFTs } from '@app/api/nftService';

export default function NFTCollectionPage() {
    const [nfts, setNfts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadNFTs() {
            try {
                const userNFTs = await fetchUserNFTs();
                setNfts(userNFTs);
            } catch (error) {
                console.error("Failed to load NFTs", error);
            } finally {
                setLoading(false);
            }
        }

        loadNFTs();
    }, []);

    if (loading) return <p>Loading NFTs...</p>;

    return (
        <div className="min-h-screen bg-surface-primary-default p-8">
            <H1 className="text-content-title mb-8">My NFT Collection</H1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nfts.length > 0 ? (
                    nfts.map((nft) => (
                        <NftCard
                            key={nft.id}
                            imageUrl={nft.imageUrl}
                            title={nft.name}
                            description={nft.description}
                        />
                    ))
                ) : (
                    <p>You don't own any NFTs yet.</p>
                )}
            </div>
        </div>
    );
}