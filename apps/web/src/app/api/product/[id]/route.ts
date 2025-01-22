import { NextResponse } from "next/server";
import { api } from "~/trpc/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const id = Number.parseInt(params.id);
	const product = await api.product.getProductById({ id });

	if (!product) {
		return NextResponse.json({ error: "Product not found" }, { status: 404 });
	}

	return NextResponse.json(product);
}
