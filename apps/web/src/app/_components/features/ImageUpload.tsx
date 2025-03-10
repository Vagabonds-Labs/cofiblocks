import { CameraIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

interface ImageUploadProps {
	onImageUploaded: (ipfsHash: string) => void;
	className?: string;
}

interface PinataResponse {
	success: boolean;
	ipfsHash: string;
	error?: string;
}

export function ImageUpload({
	onImageUploaded,
	className = "",
}: ImageUploadProps) {
	const { t } = useTranslation();
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFileChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			try {
				// Create temporary preview
				const objectUrl = URL.createObjectURL(file);
				setPreviewUrl(objectUrl);
				setIsUploading(true);
				setError(null);

				// Create form data
				const formData = new FormData();
				formData.append("file", file);

				// Upload to our API endpoint
				const response = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				const data = (await response.json()) as PinataResponse;

				if (!response.ok || !data.success) {
					throw new Error(data.error ?? "Failed to upload image");
				}

				// Update preview URL to use IPFS gateway
				const ipfsUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${data.ipfsHash}`;
				setPreviewUrl(ipfsUrl);
				onImageUploaded(data.ipfsHash);

				// Clean up the temporary object URL
				URL.revokeObjectURL(objectUrl);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Failed to upload image";
				setError(errorMessage);
				console.error("Upload error:", error);
			} finally {
				setIsUploading(false);
			}
		},
		[onImageUploaded],
	);

	return (
		<div className={`relative ${className}`}>
			<input
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
				id="image-upload"
				disabled={isUploading}
			/>

			<label
				htmlFor="image-upload"
				className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
          ${isUploading ? "bg-gray-100" : "hover:bg-gray-50"} 
          ${error ? "border-red-300" : "border-gray-300"}`}
			>
				{previewUrl ? (
					<div className="relative w-full h-full">
						<Image
							src={previewUrl}
							alt="Preview"
							fill
							className="object-cover rounded-lg"
							unoptimized
						/>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center pt-5 pb-6">
						<CameraIcon className="w-12 h-12 mb-4 text-gray-400" />
						<p className="mb-2 text-sm text-gray-500">
							{isUploading ? t("uploading") : t("click_to_upload")}
						</p>
						<p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
					</div>
				)}
			</label>

			{error && <p className="mt-2 text-sm text-red-600">{error}</p>}
		</div>
	);
}
