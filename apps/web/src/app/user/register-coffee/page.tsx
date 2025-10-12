"use client";

import { ClockIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import RadioButton from "@repo/ui/form/radioButton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ImageUpload } from "~/app/_components/features/ImageUpload";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { api } from "~/trpc/react";
import { RoastLevel } from "~/types";
import { TRPCClientError } from "@trpc/client";

const MARKET_FEE_BPS = 5000; // 50%

const schema = z.object({
	roast: z.string().min(1, "Roast level is required"),
	price: z.string().min(1, "Price is required"),
	ground_coffee_stock: z.number().min(0, "Ground coffee stock must be a positive number"),
	beans_coffee_stock: z.number().min(0, "Beans coffee stock must be a positive number"),
	description: z.string().min(1, "Description is required"),
	variety: z.string().min(1, "Variety is required"),
	coffeeScore: z.number().optional(),
	image: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterCoffee() {
	const { t } = useTranslation();
	const router = useRouter();
	const mutation = api.product.createProduct.useMutation();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const calculateFee = (amount: number): number => {
		return (amount * MARKET_FEE_BPS) / 10000;
	};

	const { register, handleSubmit, control, getValues, setValue, watch } =
		useForm<FormData>({
			resolver: zodResolver(schema),
			defaultValues: {
				roast: RoastLevel.LIGHT,
				ground_coffee_stock: 0,
				beans_coffee_stock: 0,
			},
		});

	const price = watch("price");
	const priceNumber = Number.parseFloat(price || "0");
	const operatingFee = calculateFee(priceNumber);
	const totalSalesValue = priceNumber + operatingFee;
	const producerValue = priceNumber;

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);
		const submissionData = {
			...data,
			price: Number.parseFloat(data.price),
		};
		try {
			await mutation.mutateAsync({
				name: submissionData.variety,
				price: submissionData.price,
				description: submissionData.description,
				image: submissionData.image ?? "/images/cafe1.webp",
				strength: submissionData.roast,
				ground_coffee_stock: submissionData.ground_coffee_stock,
				beans_coffee_stock: submissionData.beans_coffee_stock,
			});
			toast.success(t("product_registered_successfully"));
			router.push("/marketplace");
		} catch (error) {
			console.log("error registering", error);
			if (error instanceof TRPCClientError && error.message.includes("User is not a producer or roaster")) {
				toast.error(t(error.message));
			} else {
				toast.error(t("error_registering_product"));
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ProfileOptionLayout
			title={t("register_coffee")}
			backLink="/user/my-coffee"
		>
			<div className="p-6 bg-white rounded-lg">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="flex flex-col items-center my-8">
						<div className="w-full max-w-md">
							<ImageUpload
								className="w-full aspect-square rounded-lg"
								onImageUploaded={(hash: string) => {
									void setValue("image", hash, {
										shouldValidate: true,
									});
								}}
							/>
						</div>
					</div>
					<div className="my-4">
						<label className="text-content-body-default block mb-1">
							{t("coffee_variety")}
						</label>
						<input
							{...register("variety")}
							type="text"
							className="w-full border border-surface-border rounded p-2"
							placeholder={t("type_here")}
						/>
					</div>
					<div className="my-2">
						<label className="text-content-body-default block mb-1">
							{t("coffee_description")}
						</label>
						<textarea
							{...register("description")}
							className="w-full border border-surface-border rounded p-2"
							placeholder={t("type_here")}
						/>
					</div>
					<div className="my-2">
						<label className="text-content-body-default block mb-1">
							{t("coffee_score")}{" "}
							<span className="text-content-body-soft">
								({t("not_mandatory")})
							</span>
						</label>
						<input
							{...register("coffeeScore", {
								valueAsNumber: true,
								min: { value: 0, message: "Score must be at least 0" },
								max: { value: 100, message: "Score must be at most 100" },
							})}
							type="text"
							min="0"
							max="100"
							step="1"
							onKeyDown={(e) => {
								if (
									!/[0-9]/.test(e.key) &&
									e.key !== "Backspace" &&
									e.key !== "Delete" &&
									e.key !== "ArrowLeft" &&
									e.key !== "ArrowRight"
								) {
									e.preventDefault();
								}
							}}
							onChange={(e) => {
								let value = e.target.value.replace(/\D/g, "");
								if (value.length > 3) {
									value = value.slice(0, 3);
								}
								if (Number.parseInt(value) > 100) {
									value = value.slice(0, 3);
								}
								e.target.value = value;
								setValue(
									"coffeeScore",
									value ? Number.parseInt(value) : undefined,
								);
							}}
							className="w-full border border-surface-border rounded p-2"
							placeholder={t("score_placeholder")}
						/>
					</div>
					<div className="my-6">
						<label className="text-content-body-default block mb-2">
							{t("roast_level")}
						</label>
						<div className="flex flex-col space-y-2">
							{Object.values(RoastLevel).map((level) => (
								<div
									key={level}
									className="flex items-center justify-between p-3 bg-surface-primary-soft rounded-lg cursor-pointer"
									onClick={() => {
										setValue("roast", level);
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											setValue("roast", level);
										}
									}}
								>
									<div className="flex items-center">
										<ClockIcon
											className="w-5 h-5 mr-3"
											color="bg-surface-primary-default"
										/>
										<span
											className={`text-sm font-bold ${(getValues("roast") as RoastLevel) === level ? "text-content-title" : "text-content-body-default"}`}
										>
											{t(`strength.${level}`)}
										</span>
									</div>
									<RadioButton
										name="roast"
										label=""
										value={level}
										control={control}
									/>
								</div>
							))}
						</div>
					</div>
					<div className="my-8 flex justify-between items-center">
						<p className="text-content-body-default">
							${operatingFee.toFixed(2)} USD
						</p>
					</div>
					<div className="my-4">
						<label className="text-content-body-default block mb-1">
							{t("price_per_bag")} (USD)
						</label>
						<input
							{...register("price")}
							type="text"
							className="w-full border border-surface-border rounded p-2"
							placeholder={t("enter_price_placeholder")}
							onKeyPress={(event) => {
								if (!/[0-9.]/.test(event.key)) {
									event.preventDefault();
								}
							}}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								const value = event.target.value;
								const parts = value.split(".");
								if (parts[1] && parts[1].length > 2) {
									const price = `${parts[0]}.${parts[1].slice(0, 2)}`;
									event.target.value = price;
									setValue("price", price);
								} else {
									setValue("price", value);
								}
							}}
							onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
								const value = Number.parseFloat(event.target.value);
								if (!Number.isNaN(value)) {
									const formattedValue = value.toFixed(2);
									event.target.value = formattedValue;
									setValue("price", formattedValue);
								}
							}}
						/>
					</div>
					<div className="my-6 p-6 rounded bg-surface-primary-soft">
						<p className="text-[0.875rem] text-content-body-default">
							{t("total_sales_value_per_bag")}
						</p>
						<p className="font-medium text-[0.875rem]">
							${totalSalesValue.toFixed(2)} USD
						</p>
						<p className="mt-2 text-[0.875rem] text-content-body-default">
							{t("producer_value_per_bag")}
						</p>
						<p className="font-medium text-[0.875rem]">
							${producerValue.toFixed(2)} USD
						</p>
					</div>
					<div className="my-6">
						<label className="text-content-body-default block mb-1">
							{t("ground_coffee_stock")} (340g)
						</label>
						<div className="flex items-center justify-between rounded-lg p-2 border border-surface-border">
							<Button
								className="!p-0 w-5 h-5 rounded-md text-white"
								onClick={() => {
									const currentValue = Number.parseInt(
										getValues("ground_coffee_stock").toString(),
									);
									if (currentValue > 0) {
										setValue("ground_coffee_stock", currentValue - 1);
									}
								}}
								type="button"
							>
								-
							</Button>
							<input
								type="text"
								className="w-16 text-center bg-transparent text-content-body-default text-lg"
								{...register("ground_coffee_stock", {
									onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
										const value =
											e.target.value === ""
												? 0
												: Number.parseInt(e.target.value);
										if (!Number.isNaN(value) && value >= 0) {
											setValue("ground_coffee_stock", value);
										}
									},
								})}
							/>
							<Button
								className="!p-0 w-5 h-5 rounded-md text-white"
								onClick={() => {
									const currentValue = Number.parseInt(
										getValues("ground_coffee_stock").toString(),
									);
									setValue("ground_coffee_stock", currentValue + 1);
								}}
								type="button"
							>
								+
							</Button>
						</div>
					</div>
					<div className="my-6">
						<label className="text-content-body-default block mb-1">
							{t("beans_coffee_stock")} (340g)
						</label>
						<div className="flex items-center justify-between rounded-lg p-2 border border-surface-border">
							<Button
								className="!p-0 w-5 h-5 rounded-md text-white"
								onClick={() => {
									const currentValue = Number.parseInt(
										getValues("beans_coffee_stock").toString(),
									);
									if (currentValue > 0) {
										setValue("beans_coffee_stock", currentValue - 1);
									}
								}}
								type="button"
							>
								-
							</Button>
							<input
								type="text"
								className="w-16 text-center bg-transparent text-content-body-default text-lg"
								{...register("beans_coffee_stock", {
									onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
										const value =
											e.target.value === ""
												? 0
												: Number.parseInt(e.target.value);
										if (!Number.isNaN(value) && value >= 0) {
											setValue("beans_coffee_stock", value);
										}
									},
								})}
							/>
							<Button
								className="!p-0 w-5 h-5 rounded-md text-white"
								onClick={() => {
									const currentValue = Number.parseInt(
										getValues("beans_coffee_stock").toString(),
									);
									setValue("beans_coffee_stock", currentValue + 1);
								}}
								type="button"
							>
								+
							</Button>
						</div>
					</div>
					<Button
						type="submit"
						className="py-6 rounded w-full"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<div className="flex items-center justify-center">
								<svg
									className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<title>Loading spinner</title>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								{t("saving")}
							</div>
						) : (
							t("save_and_publish")
						)}
					</Button>
				</form>
			</div>
		</ProfileOptionLayout>
	);
}
