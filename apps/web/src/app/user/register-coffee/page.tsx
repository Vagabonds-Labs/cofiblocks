"use client";

import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import InputField from "@repo/ui/form/inputField";
import NumericField from "@repo/ui/form/numericField";
import RadioButton from "@repo/ui/form/radioButton";
import TextAreaField from "@repo/ui/form/textAreaField";
import { useAccount, useProvider } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ImageUpload } from "~/app/_components/features/ImageUpload";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import {
	ContractsError,
	ContractsInterface,
	useCofiCollectionContract,
	useMarketplaceContract,
	useStarkContract,
} from "~/services/contractsInterface";
import { api } from "~/trpc/react";
import { RoastLevel } from "~/types";
import { getStarknetPrice, usdToStrk } from "~/utils/priceConverter";

const schema = z.object({
	roast: z.string().min(1, "Roast level is required"),
	price: z.string().min(1, "Price is required"),
	bagsAvailable: z.number().min(0, "Available bags must be a positive number"),
	description: z.string().min(1, "Description is required"),
	variety: z.string().min(1, "Variety is required"),
	coffeeScore: z
		.number()
		.min(0, "Coffee score must be a positive number")
		.max(100, "Coffee score must be at most 100")
		.optional(),
	image: z.string().min(1, "Image is required"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterCoffee() {
	const { t } = useTranslation();
	const router = useRouter();
	const { provider } = useProvider();
	const contracts = new ContractsInterface(
		useAccount(),
		useCofiCollectionContract(),
		useMarketplaceContract(),
		useStarkContract(),
		provider,
	);
	const mutation = api.product.createProduct.useMutation();
	const [strkPrice, setStrkPrice] = useState<number | null>(null);
	const [isLoadingPrice, setIsLoadingPrice] = useState(false);

	const fetchStrkPrice = useCallback(async () => {
		try {
			setIsLoadingPrice(true);
			const price = await getStarknetPrice();
			setStrkPrice(price);
		} catch (error) {
			console.error("Error fetching STRK price:", error);
		} finally {
			setIsLoadingPrice(false);
		}
	}, []);

	useEffect(() => {
		void fetchStrkPrice();
		// Refresh price every 5 minutes
		const interval = setInterval(() => void fetchStrkPrice(), 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, [fetchStrkPrice]);

	const { register, handleSubmit, control, setValue, watch } =
		useForm<FormData>({
			resolver: zodResolver(schema),
			defaultValues: {
				roast: RoastLevel.LIGHT,
				bagsAvailable: 1,
				price: "",
				coffeeScore: 0,
			},
		});

	const price = watch("price");

	const onSubmit = async (data: FormData) => {
		if (!strkPrice) {
			alert(t("error_strk_price_unavailable"));
			return;
		}

		const usdPrice = Number.parseFloat(data.price);
		const strkAmount = usdToStrk(usdPrice, strkPrice);

		try {
			const token_id = await contracts.register_product(
				strkAmount,
				data.bagsAvailable,
			);

			await mutation.mutateAsync({
				tokenId: token_id,
				name: data.variety,
				price: strkAmount,
				description: data.description,
				image: `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${data.image}`,
				strength: data.roast,
				region: "",
				farmName: "",
			});

			alert(t("product_registered_successfully"));
			router.push("/user/my-coffee");
		} catch (error) {
			if (error instanceof ContractsError) {
				if (error.code === ContractsError.USER_MISSING_ROLE) {
					alert(t("user_not_registered_as_seller"));
				} else if (error.code === ContractsError.USER_NOT_CONNECTED) {
					alert(t("user_disconnected"));
				}
			} else {
				console.error("Error registering:", error);
				alert(t("error_registering_product"));
			}
		}
	};

	const handlePriceChange = (value: string) => {
		// Only allow numbers and one decimal point
		const formatted = value.replace(/[^\d.]/g, "");
		const parts = formatted.split(".");
		if (parts.length > 2) return; // Don't allow multiple decimal points
		if (parts[1] && parts[1].length > 2) return; // Only allow 2 decimal places
		setValue("price", formatted);
	};

	const getStrkEquivalent = (usdPrice: string): string => {
		if (!strkPrice || !usdPrice) return "";
		const usdAmount = Number.parseFloat(usdPrice);
		if (Number.isNaN(usdAmount)) return "";
		return `≈ ${usdToStrk(usdAmount, strkPrice).toFixed(2)} STRK`;
	};

	return (
		<ProfileOptionLayout title={t("register_coffee")}>
			<div className="mt-20">
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-8 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm"
				>
					<div className="space-y-6">
						<ImageUpload
							className="mb-8"
							onImageUploaded={(hash: string) => {
								void setValue("image", hash, {
									shouldValidate: true,
								});
							}}
						/>

						<InputField
							name="variety"
							control={control}
							label={t("variety")}
							placeholder={t("enter_variety")}
						/>

						<TextAreaField
							name="description"
							control={control}
							label={t("description")}
							placeholder={t("enter_description")}
						/>

						<InputField
							name="price"
							control={control}
							label={t("price")}
							placeholder="0.00"
							description={isLoadingPrice ? "Loading..." : "USD"}
							onChange={handlePriceChange}
							inputClassName="pr-24"
						/>
						{!isLoadingPrice && strkPrice && (
							<div className="text-sm text-gray-500 mt-1">
								{getStrkEquivalent(price)}
							</div>
						)}

						<NumericField
							name="bagsAvailable"
							control={control}
							label={t("bags_available")}
							min={1}
							max={1000}
						/>

						<div className="space-y-3">
							<label className="block text-sm font-medium text-gray-700">
								{t("roast_level")}
							</label>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								{Object.values(RoastLevel).map((level) => (
									<RadioButton
										key={level}
										{...register("roast")}
										value={level}
										label={t(level.toLowerCase())}
										control={control}
									/>
								))}
							</div>
						</div>

						<NumericField
							name="coffeeScore"
							control={control}
							label={t("coffee_score")}
							min={0}
							max={100}
							step={1}
						/>
					</div>

					<div className="flex justify-end pt-6 border-t border-gray-200">
						<Button
							type="submit"
							disabled={mutation.isPending || isLoadingPrice || !strkPrice}
							className="inline-flex justify-center"
						>
							{mutation.isPending ? (
								<>
									<ArrowPathRoundedSquareIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
									{t("registering")}
								</>
							) : (
								t("register")
							)}
						</Button>
					</div>
				</form>
			</div>
		</ProfileOptionLayout>
	);
}
