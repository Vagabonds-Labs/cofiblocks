"use client";

import {
	ArrowPathRoundedSquareIcon,
	CameraIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import RadioButton from "@repo/ui/form/radioButton";
import { useAccount, useContract, useContractWrite, useWaitForTransaction } from "@starknet-react/core";
import Image from "next/image";
import { FormEvent, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CallData } from "starknet";
import { z } from "zod";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";
import { RoastLevel } from "~/types";

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
	image: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterCoffee() {
	const { t } = useTranslation();
	const handleImageUpload = () => {
		alert(t("implement_image_upload"));
	};

	const { register, handleSubmit, control, getValues, setValue } =
		useForm<FormData>({
			resolver: zodResolver(schema),
			defaultValues: {
				roast: RoastLevel.LIGHT,
				bagsAvailable: 1,
			},
		});

	const { address } = useAccount();

	const ABI = undefined; // Define the ABI here or remove line if you import from another file
	const { contract } = useContract({ abi: ABI, address });
	
	const calls = useMemo(() => {
		if (!contract || typeof contract === undefined) return;
	
		const { bagsAvailable: initial_stock, price, roast, description, variety, coffeeScore, image } = getValues();
		const newDataSpan = [roast, description, variety, coffeeScore, image];
		const parsedPrice = Number.parseFloat(price);
	
		// @ts-expect-error I have already done type safety for the contract above, it still gives an error here
		return contract?.populateTransaction?.["create_product"](
		CallData.compile([initial_stock, parsedPrice, newDataSpan])
		);
	}, [contract, getValues]);
	
	const { writeAsync, data: writeData, isPending: writeIsPending } = useContractWrite({ calls });
	
	const { isLoading: waitIsLoading, data: waitData } = useWaitForTransaction({
		hash: writeData?.transaction_hash,
		watch: true,
	});
	
	const onSubmit = async (data: FormData) => {
		console.log('Submit button clicked') // Debugging steps, will be removed
		if (!calls) {
			console.log('Calls not defined') // Debugging steps, will be removed
			return
		};
	
		try {
			await writeAsync();
			console.log("Submission successful", data);
		} catch (error) {
			console.error("Error during submission", error);
		}
	};	  

	// const onSubmit = async (data: FormData, event) => {
	// 	const submissionData = {
	// 		...data,
	// 		price: Number.parseFloat(data.price),
	// 	};
	// 	const { 
	// 		bagsAvailable: initial_stock, price: cost, roast, description, variety, coffeeScore, image
	// 	 } = data
	// 	const newDataSpan = [roast, description, variety, coffeeScore, image]

	// 	const ABI = undefined
	// 	const price = Number.parseFloat(cost)

	// 	const { contract } = useContract({
	// 		abi: ABI,
	// 		address,
	// 	})

	// 	const calls = useMemo(() => {
	// 		// if (!contract?.populateTransaction) return
	// 		return contract?.populateTransaction["create_product"](
	// 			CallData.compile([initial_stock, price, newDataSpan])
	// 		)
	// 	}, [contract, address, initial_stock, price, newDataSpan])

	// 	const {
	// 		writeAsync, data: writeData, isPending: writeIsPending
	// 	} = useContractWrite({
	// 		calls
	// 	})

	// 	const {
	// 		isLoading: waitIsLoading, data: waitData
	// 	} = useWaitForTransaction({
	// 		hash: writeData?.transaction_hash,
	// 		watch: true
	// 	})

	// 	event?.preventDefault()
	// 	await writeAsync()
	// 	// TODO: Implement coffee registration logic
	// 	console.log(submissionData);
	// };

	return (
		<ProfileOptionLayout
			title={t("register_coffee")}
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
							{t("choose_coffee_photo")}
						</Button>
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
					<div className="mb-2">
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
						<div className="flex items-center font-medium">
							<ArrowPathRoundedSquareIcon className="w-6 h-6 mr-2" />
							<label className="text-content-body-default">
								{t("operating_fee")}
							</label>
						</div>
						<p className="text-content-body-default">$20.00</p>
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
						<p className="font-medium text-[0.875rem]">30 USD</p>
						<p className="mt-2 text-[0.875rem] text-content-body-default">
							{t("producer_value_per_bag")}
						</p>
						<p className="font-medium text-[0.875rem]">25 USD</p>
					</div>
					<div className="my-6">
						<label className="text-content-body-default block mb-1">
							{t("bags_available")} (340g)
						</label>
						<div className="flex items-center justify-between rounded-lg p-2 border border-surface-border">
							<Button
								className="!p-0 w-5 h-5 rounded-md text-white"
								onClick={() => {
									const currentValue = Number.parseInt(
										getValues("bagsAvailable").toString(),
									);
									if (currentValue > 0) {
										setValue("bagsAvailable", currentValue - 1);
									}
								}}
								type="button"
							>
								-
							</Button>
							<input
								type="text"
								className="w-16 text-center bg-transparent text-content-body-default text-lg"
								{...register("bagsAvailable", {
									onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
										const value =
											e.target.value === ""
												? 0
												: Number.parseInt(e.target.value);
										if (!Number.isNaN(value) && value >= 0) {
											setValue("bagsAvailable", value);
										}
									},
								})}
							/>
							<Button
								className="!p-0 w-5 h-5 rounded-md text-white"
								onClick={() => {
									const currentValue = Number.parseInt(
										getValues("bagsAvailable").toString(),
									);
									setValue("bagsAvailable", currentValue + 1);
								}}
								type="button"
							>
								+
							</Button>
						</div>
					</div>
					<Button type="submit" className="py-6 rounded w-full">
						{t("save_and_publish")}
					</Button>
				</form>
			</div>
		</ProfileOptionLayout>
	);
}
