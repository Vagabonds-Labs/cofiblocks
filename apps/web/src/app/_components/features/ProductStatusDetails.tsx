"use client";

import {
	CheckCircleIcon,
	ShoppingBagIcon,
	TruckIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";
import { LightBulbIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import RadioButton from "@repo/ui/form/radioButton";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BottomModal from "~/app/_components/ui/BottomModal";

type ProductDetails = {
	productName: string;
	status: string;
	roast: string;
	type: string;
	quantity: string;
	delivery: string;
	totalPrice: string;
	address?: string;
};

enum StatusStepsEnum {
	Paid = "Paid",
	Shipped = "Shipped",
	Prepared = "Prepared",
	Delivered = "Delivered",
}

enum DeliveryTypeEnum {
	Meetup = "Meetup",
	Delivery = "Delivery",
}

const orderStatusSchema = z.object({
	status: z.nativeEnum(StatusStepsEnum),
});

type FormValues = z.infer<typeof orderStatusSchema>;

interface ProductStatusDetailsProps {
	productDetails: ProductDetails;
	isProducer: boolean;
	updateProductDetails?: (productDetails: ProductDetails) => void;
}

export default function ProductStatusDetails({
	productDetails,
	isProducer,
	updateProductDetails,
}: ProductStatusDetailsProps) {
	const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] =
		useState<boolean>(false);

	const { control, handleSubmit, setValue } = useForm<FormValues>({
		defaultValues: {
			status: StatusStepsEnum.Paid,
		},
		resolver: zodResolver(orderStatusSchema),
	});

	useEffect(() => {
		if (productDetails?.status) {
			setValue("status", productDetails.status as StatusStepsEnum);
		}
	}, [productDetails, setValue]);

	const statusStepsKeys = Object.keys(StatusStepsEnum);

	const openOrderStatusModal = () => {
		setIsOrderStatusModalOpen(true);
	};

	const closeOrderStatusModal = () => {
		setIsOrderStatusModalOpen(false);
	};

	const onSubmit = (data: FormValues) => {
		if (productDetails && updateProductDetails) {
			updateProductDetails({
				...productDetails,
				status: data.status,
			});
		}

		closeOrderStatusModal();
	};

	if (!productDetails) return <div>Loading...</div>;

	const ProductStatus = ({
		productDetails,
	}: { productDetails: ProductDetails }) => {
		const stepsByDeliveryType = {
			[DeliveryTypeEnum.Meetup]: [
				StatusStepsEnum.Paid,
				StatusStepsEnum.Prepared,
				StatusStepsEnum.Delivered,
			],
			[DeliveryTypeEnum.Delivery]: [
				StatusStepsEnum.Paid,
				StatusStepsEnum.Shipped,
				StatusStepsEnum.Delivered,
			],
		};
		const statusSteps =
			stepsByDeliveryType[productDetails.delivery as DeliveryTypeEnum];
		const currentStepIndex = statusSteps.indexOf(
			productDetails.status as StatusStepsEnum,
		);
		const stepIconMap = {
			[StatusStepsEnum.Paid]: WalletIcon,
			[StatusStepsEnum.Shipped]: TruckIcon,
			[StatusStepsEnum.Prepared]: ShoppingBagIcon,
			[StatusStepsEnum.Delivered]: CheckCircleIcon,
		};

		return (
			<div className="flex items-center justify-between w-full">
				{statusSteps.map((step, index) => (
					<div
						key={step}
						className="flex items-center"
						style={{
							width: `${index < statusSteps.length - 1 ? "inherit" : "unset"}`,
						}}
					>
						<div className="flex flex-col items-center w-10">
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center ${
									index <= currentStepIndex
										? "bg-surface-secondary-default"
										: "bg-surface-primary-soft"
								}`}
							>
								{React.createElement(stepIconMap[step], {
									className: `w-4 h-4 ${
										index <= currentStepIndex ? "text-black" : "text-gray-500"
									}`,
								})}
							</div>
							<span className="text-sm mt-1">{step}</span>
						</div>
						{index < statusSteps.length - 1 && (
							<div
								className={`h-1 ${
									index < currentStepIndex
										? "bg-surface-secondary-default"
										: "bg-surface-primary-soft"
								} flex-grow`}
								style={{
									marginLeft: "-4px",
									marginRight: "-12px",
									marginBottom: "24px",
								}}
							/>
						)}
					</div>
				))}
			</div>
		);
	};

	const OrderStatusBanner = ({
		orderStatus,
		isProducer,
	}: { orderStatus: string; isProducer: boolean }) => {
		const statusText = {
			[StatusStepsEnum.Paid]: "The Producer is already preparing your order",
			[StatusStepsEnum.Shipped]: "The Producer has already shipped your order",
			[StatusStepsEnum.Prepared]:
				"The Producer has already prepared your order",
			[StatusStepsEnum.Delivered]: "Your order has arrived. Enjoy your coffee",
		};

		if (isProducer) {
			return (
				<div className="bg-surface-primary-soft p-4 rounded-lg flex items-center justify-between">
					<LightBulbIcon className="w-8 h-8 mr-4" />
					<div>
						<p className="text-success-content font-bold flex items-center">
							New order
						</p>
						<p className="text-xs text-gray-600">
							You have a new order. Let's start the preparations.
						</p>
					</div>
					<button
						className="bg-surface-secondary-default px-3 py-1 ml-4 rounded-lg"
						type="button"
					>
						Tips
					</button>
				</div>
			);
		}

		return (
			<div className="bg-surface-primary-soft p-4 rounded-lg flex items-center justify-between">
				<div>
					<p className="text-success-content flex items-center">
						<LightBulbIcon className="w-6 h-6 mr-4" />
						{statusText[orderStatus as keyof typeof statusText]}
					</p>
				</div>
			</div>
		);
	};

	return (
		<div className="bg-white rounded-lg space-y-4">
			<div className="my-8">
				<OrderStatusBanner
					orderStatus={productDetails.status}
					isProducer={isProducer}
				/>
			</div>

			<div className="flex items-center space-x-4 !mb-10">
				<img
					src="/images/cafe2.webp"
					alt="Product"
					className="w-12 h-12 rounded-md object-cover"
				/>
				<p className="font-semibold">{productDetails.productName}</p>
			</div>

			<div className="!my-8">
				<ProductStatus productDetails={productDetails} />
			</div>

			{isProducer && (
				<button
					type="button"
					className="w-full !mb-2 p-2 bg-surface-secondary-default rounded-lg"
					onClick={openOrderStatusModal}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							openOrderStatusModal();
						}
					}}
				>
					Change status
				</button>
			)}

			<div className="space-y-2">
				{[
					{ label: "Roast", value: productDetails.roast },
					{ label: "Type", value: productDetails.type },
					{ label: "Quantidade", value: productDetails.quantity },
					{
						label: "Delivery",
						value:
							productDetails.delivery === DeliveryTypeEnum.Delivery
								? "My address"
								: productDetails.delivery,
						address: productDetails.address,
					},
					{ label: "Total price", value: productDetails.totalPrice },
				].map((item, index, array) => (
					<>
						<div
							key={item.label}
							className="flex justify-between items-start py-3"
						>
							<div className="w-3/4">
								<p className="font-semibold">{item.label}</p>
								{item.address && (
									<p className="text-sm text-gray-500 mt-1 break-words">
										{item.address}
									</p>
								)}
							</div>
							<p className="w-1/2 text-right break-words">{item.value}</p>
						</div>
						{index < array.length - 1 && <hr className="my-1" />}
					</>
				))}
			</div>

			{isProducer && (
				<BottomModal
					isOpen={isOrderStatusModalOpen}
					onClose={closeOrderStatusModal}
				>
					<h3 className="text-xl font-semibold mb-4 text-content-title">
						Select the status
					</h3>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="flex flex-col gap-2">
							{statusStepsKeys.map((status, index) => (
								<>
									<label key={status} className="flex items-center gap-2">
										<RadioButton
											name="status"
											label={status}
											value={status}
											control={control}
										/>
									</label>
									{index < statusStepsKeys.length - 1 && (
										<hr className="my-2 border-surface-primary-soft" />
									)}
								</>
							))}
						</div>
						<Button type="submit" className="w-full !mt-6">
							Apply
						</Button>
					</form>
				</BottomModal>
			)}
		</div>
	);
}
