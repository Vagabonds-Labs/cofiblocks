import { type NextRequest, NextResponse } from "next/server";
import { uploadToPinata, validateImage } from "../../../utils/pinata";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		if (!validateImage(file)) {
			return NextResponse.json(
				{ error: "Invalid file type or size" },
				{ status: 400 },
			);
		}

		const ipfsHash = await uploadToPinata(file);

		return NextResponse.json({
			success: true,
			ipfsHash,
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 },
		);
	}
}
