"use client";

import {
	CheckCircleIcon,
	ShoppingBagIcon,
	TruckIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProductDetailsList } from "./ProductDetailsList";
import { StatusBanner } from "./StatusBanner";
import { StatusUpdateModal } from "./StatusUpdateModal";

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

export enum StatusStepsEnum {
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
	const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false);

	const { control, handleSubmit, setValue } = useForm<{
		status: StatusStepsEnum;
	}>({
		defaultValues: { status: StatusStepsEnum.Paid },
		resolver: zodResolver(orderStatusSchema),
	});

	useEffect(() => {
		if (productDetails?.status) {
			setValue("status", productDetails.status as StatusStepsEnum);
		}
	}, [productDetails, setValue]);

	const statusStepsKeys = Object.keys(StatusStepsEnum);

	const openOrderStatusModal = () => setIsOrderStatusModalOpen(true);
	const closeOrderStatusModal = () => setIsOrderStatusModalOpen(false);

	const onSubmit = (data: { status: StatusStepsEnum }) => {
		if (productDetails && updateProductDetails) {
			updateProductDetails({ ...productDetails, status: data.status });
		}
		closeOrderStatusModal();
	};

	const handleSubmitForm = handleSubmit(onSubmit);

	if (!productDetails) return <div>Loading...</div>;

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
		<div className="bg-white rounded-lg space-y-4">
			<div className="my-8">
				<StatusBanner
					orderStatus={productDetails.status}
					isProducer={isProducer}
				/>
			</div>

			<div className="flex items-center space-x-4 !mb-10">
				<Image
					src="/images/cafe2.webp"
					alt="Product"
					width={48}
					height={48}
					className="rounded-md object-cover"
				/>
				<p className="font-semibold">{productDetails.productName}</p>
			</div>

			<div className="!my-8 flex items-center justify-between w-full">
				{statusSteps.map((step, index) => (
					<div key={step} className="flex items-center">
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

			<ProductDetailsList
				details={[
					{ label: "Roast", value: productDetails.roast },
					{ label: "Type", value: productDetails.type },
					{ label: "Quantity", value: productDetails.quantity },
					{
						label: "Delivery",
						value:
							productDetails.delivery === DeliveryTypeEnum.Delivery.toString()
								? "My address"
								: productDetails.delivery,
						address: productDetails.address,
					},
					{ label: "Total price", value: productDetails.totalPrice },
				]}
			/>

			{isProducer && (
				<StatusUpdateModal
					isOpen={isOrderStatusModalOpen}
					onClose={closeOrderStatusModal}
					onSubmit={handleSubmitForm}
					control={control}
					statusStepsKeys={statusStepsKeys}
				/>
			)}
		</div>
	);
}
