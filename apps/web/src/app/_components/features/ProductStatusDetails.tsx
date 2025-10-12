"use client";

import {
	CheckCircleIcon,
	ShoppingBagIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import type { OrderStatus } from "@prisma/client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ProductDetailsList } from "./ProductDetailsList";
import { StatusBanner } from "./StatusBanner";
import StatusUpdateModal from "./StatusUpdateModal";

interface ProductDetails {
	productName: string;
	status: OrderStatus;
	roast: string;
	type: string;
	quantity: string;
	delivery: string;
	totalPrice: string;
	address?: string;
}

enum DeliveryTypeEnum {
	Meetup = "Meetup",
	Delivery = "Delivery",
}

const _OrderStatusEnum = {
	PENDING: "PENDING",
	COMPLETED: "COMPLETED",
	CANCELLED: "CANCELLED",
} as const;

const orderStatusSchema = z.object({
	status: z.enum(["PENDING", "COMPLETED", "CANCELLED"] as const),
});

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
	const { t } = useTranslation();

	const { control, handleSubmit, setValue } = useForm<{
		status: OrderStatus;
	}>({
		defaultValues: { status: "PENDING" },
		resolver: zodResolver(orderStatusSchema),
	});

	useEffect(() => {
		if (productDetails?.status) {
			setValue("status", productDetails.status);
		}
	}, [productDetails, setValue]);

	const statusStepsKeys = ["PENDING", "COMPLETED", "CANCELLED"];

	const closeOrderStatusModal = () => setIsOrderStatusModalOpen(false);

	const onSubmit = (data: { status: OrderStatus }) => {
		if (productDetails && updateProductDetails) {
			updateProductDetails({ ...productDetails, status: data.status });
		}
		closeOrderStatusModal();
	};

	const handleSubmitForm = handleSubmit(onSubmit);

	if (!productDetails) return <div>Loading...</div>;

	const stepsByDeliveryType = {
		[DeliveryTypeEnum.Meetup]: ["PENDING", "COMPLETED", "CANCELLED"],
		[DeliveryTypeEnum.Delivery]: ["PENDING", "COMPLETED", "CANCELLED"],
	};

	// Default to Delivery steps if delivery type doesn't match
	const deliveryType = Object.values(DeliveryTypeEnum).includes(
		productDetails.delivery as DeliveryTypeEnum,
	)
		? (productDetails.delivery as DeliveryTypeEnum)
		: DeliveryTypeEnum.Delivery;

	const statusSteps = stepsByDeliveryType[deliveryType];
	const currentStepIndex = statusSteps.indexOf(productDetails.status);

	const stepIconMap = {
		PENDING: WalletIcon,
		COMPLETED: CheckCircleIcon,
		CANCELLED: ShoppingBagIcon,
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
				{statusSteps.map((step, index) => {
					const Icon = stepIconMap[step as keyof typeof stepIconMap];
					const isCompleted = index <= currentStepIndex;
					const isActive = index === currentStepIndex;

					return (
						<div
							key={step}
							className={`flex flex-col items-center ${
								isCompleted ? "text-green-600" : "text-gray-400"
							}`}
						>
							<div
								className={`w-12 h-12 rounded-full flex items-center justify-center ${
									isActive
										? "bg-green-100"
										: isCompleted
											? "bg-green-50"
											: "bg-gray-100"
								}`}
							>
								<Icon className="w-6 h-6" />
							</div>
							<span className="mt-2 text-sm">
								{t(`order_status.${step.toLowerCase()}`)}
							</span>
						</div>
					);
				})}
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
