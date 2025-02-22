import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

interface NFTMetadata {
	description?: string;
	imageUrl?: string;
	region?: string;
	farmName?: string;
	strength?: string;
	process?: string;
}

export async function GET(
	request: NextRequest,
	{ params }: { params: { tokenId: string } },
) {
	try {
		const tokenId = Number.parseInt(params.tokenId, 10);
		if (Number.isNaN(tokenId)) {
			return NextResponse.json({ error: "Invalid token ID" }, { status: 400 });
		}

		const product = await db.product.findFirst({
			where: { tokenId },
		});

		if (!product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		let metadata: NFTMetadata = {};
		try {
			metadata =
				typeof product.nftMetadata === "string"
					? (JSON.parse(product.nftMetadata) as NFTMetadata)
					: (product.nftMetadata as NFTMetadata);
		} catch (e) {
			console.error("Error parsing metadata:", e);
			metadata = {};
		}

		// Construct standardized metadata following OpenSea metadata standards
		const standardMetadata = {
			name: product.name,
			description: metadata.description ?? "",
			image: metadata.imageUrl ?? "/images/cafe1.webp",
			external_url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.id}`,
			attributes: [
				{
					trait_type: "Region",
					value: metadata.region ?? "Unknown",
				},
				{
					trait_type: "Farm Name",
					value: metadata.farmName ?? "Unknown",
				},
				{
					trait_type: "Strength",
					value: metadata.strength ?? "Medium",
				},
				{
					trait_type: "Process",
					value: metadata.process ?? "Natural",
				},
				{
					display_type: "number",
					trait_type: "Price",
					value: product.price,
				},
			],
		};

		return NextResponse.json(standardMetadata);
	} catch (error) {
		console.error("Error serving metadata:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
