"use client";

import {
	ArrowPathRoundedSquareIcon,
	CameraIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import RadioButton from "@repo/ui/form/radioButton";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";

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

enum RoastLevel {
	LIGHT = "Light",
	MEDIUM = "Medium",
	STRONG = "Strong",
}

export default function RegisterCoffee() {
	const [roastLevel, setRoastLevel] = useState("");

	const handleImageUpload = () => {
		alert("Implement image upload");
	};

	const { register, handleSubmit, control, getValues, setValue, watch } =
		useForm<FormData>({
			resolver: zodResolver(schema),
			defaultValues: {
				roast: RoastLevel.LIGHT,
				bagsAvailable: 1,
			},
		});

	const onSubmit = async (data: FormData) => {
		const submissionData = {
			...data,
			price: Number.parseFloat(data.price),
		};
		// TODO: Implement coffee registration logic
		console.log(submissionData);
	};

	return (
		<ProfileOptionLayout title="Register my coffee" backLink="/user/my-coffee">
			<div className="p-6 bg-white rounded-lg">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="flex flex-col items-center my-6">
						<img
							src="/images/cafe1.webp"
							alt="Coffee"
							className="w-20 h-20 rounded-full mb-2"
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
					<div className="mb-2">
						<label className="text-content-body-default block mb-1">
							Coffee Score{" "}
							<span className="text-content-body-soft">(not mandatory)</span>
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
							placeholder="Enter a score between 0 and 100"
						/>
					</div>
					<div className="my-6">
						<label className="text-content-body-default block mb-2">
							Roast level
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
											className={`text-sm font-bold ${roastLevel === level ? "text-content-title" : "text-content-body-default"}`}
										>
											{level}
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
								Operating fee per bag
							</label>
						</div>
						<p className="text-content-body-default">$20.00</p>
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
							onKeyPress={(event) => {
								if (!/[0-9.]/.test(event.key)) {
									event.preventDefault();
								}
							}}
							onChange={(event) => {
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
							onBlur={(event) => {
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
							Total sales value (product + fee) per bag:
						</p>
						<p className="font-medium text-[0.875rem]">30USD</p>
						<p className="mt-2 text-[0.875rem] text-content-body-default">
							Value allocated to the producer per bag:
						</p>
						<p className="font-medium text-[0.875rem]">25USD</p>
					</div>
					<div className="my-6">
						<label className="text-content-body-default block mb-1">
							Bags available (340g)
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
									onChange: (e) => {
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
						Save and publish
					</Button>
				</form>
			</div>
		</ProfileOptionLayout>
	);
}
