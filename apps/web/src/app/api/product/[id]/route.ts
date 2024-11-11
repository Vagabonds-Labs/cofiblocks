import { NextResponse } from "next/server";
import { mockedProducts } from "~/server/api/routers/mockProducts";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const id = Number.parseInt(params.id);
	const product = mockedProducts.find((p) => p.id === id);

	if (!product) {
		return NextResponse.json({ error: "Product not found" }, { status: 404 });
	}

	return NextResponse.json(product);
}
