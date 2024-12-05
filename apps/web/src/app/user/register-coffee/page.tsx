"use client";

import {
	ArrowPathRoundedSquareIcon,
	CameraIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import { useContract } from "@starknet-react/core";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import {
	abiMarketPlace,
	marketplaceAddress,
} from "~/contracts/abi/MarketPlace";
import { RoastLevel } from "~/types";

const schema = z.object({
	roast: z.string().min(1, "Roast level is required"),
	price: z
		.string()
		.regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
		.min(1, "Price is required"),
	bagsAvailable: z.number().min(1, "Available bags must be at least 1"),
	description: z.string().min(1, "Description is required"),
	variety: z.string().min(1, "Variety is required"),
});

type FormData = z.infer<typeof schema>;


export default function RegisterCoffee() {
	const [isLoading, setIsLoading] = useState(false);
	const [transactionHash, setTransactionHash] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { contract } = useContract({
		abi: abiMarketPlace,
		address: marketplaceAddress,
	});

	const { register, handleSubmit } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			roast: RoastLevel.LIGHT,
			bagsAvailable: 1,
		},
	});

	const handleImageUpload = () => {
		alert("Implement image upload");
	};

	const onSubmit = async (data: FormData) => {
		if (!contract) {
			setError("Error with the contract connection");
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const initialStock = BigInt(data.bagsAvailable);
			const price = BigInt(Math.round(Number(data.price) * 10 ** 18));
			const metadata = [
				BigInt(`0x${Buffer.from(data.variety).toString("hex")}`),
				BigInt(`0x${Buffer.from(data.description).toString("hex")}`),
			];

			const tx = await contract.create_product(initialStock, price, metadata);

			setTransactionHash(tx.transaction_hash);
			console.log("Transaction hash:", tx.transaction_hash);
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.error("Error:", err);
				setError(err.message);
			} else {
				console.error("Unexpected error:", err);
				setError("An unexpected error occurred");
			}
		}

		return (
			<ProfileOptionLayout
				title="Register my coffee"
				backLink="/user/my-coffee"
			>
				<div className="p-6 bg-white rounded-lg">
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col items-center my-6">
							<Image
								src="/images/cafe1.webp"
								alt="Coffee"
								width={80}
								height={80}
								className="rounded-full mb-2"
							/>
							<Button
								className="mx-auto mt-4 w-46 h-10 px-2"
								onClick={handleImageUpload}
								variant="secondary"
								type="button"
							>
								<CameraIcon className="w-6 h-6 mr-2" />
								Choose coffee photo
							</Button>
						</div>

						<div className="my-4">
							<label className="text-content-body-default block mb-1">
								Coffee variety
							</label>
							<input
								{...register("variety")}
								type="text"
								className="w-full border border-surface-border rounded p-2"
								placeholder="Type here"
							/>
						</div>

						<div className="my-2">
							<label className="text-content-body-default block mb-1">
								Coffee description
							</label>
							<textarea
								{...register("description")}
								className="w-full border border-surface-border rounded p-2"
								placeholder="Type here"
							/>
						</div>

						<div className="my-4">
							<label className="text-content-body-default block mb-1">
								Price per bag (USD)
							</label>
							<input
								{...register("price")}
								type="text"
								className="w-full border border-surface-border rounded p-2"
								placeholder="Enter price (e.g. 25.99)"
							/>
						</div>

						<div className="my-4">
							<label className="text-content-body-default block mb-1">
								Bags available
							</label>
							<input
								{...register("bagsAvailable")}
								type="number"
								className="w-full border border-surface-border rounded p-2"
								placeholder="Number of bags"
							/>
						</div>

						<Button type="submit" className="py-6 rounded w-full">
							{isLoading ? "Minting..." : "Save and publish"}
						</Button>

						{transactionHash && (
							<p className="mt-4">
								Transaction submitted:{" "}
								<a
									href={`https://goerli.voyager.online/tx/${transactionHash}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 underline"
								>
									{transactionHash}
								</a>
							</p>
						)}
						{error && <p className="text-red-500 mt-4">Error: {error}</p>}
					</form>
				</div>
			</ProfileOptionLayout>
		);
	};
}
