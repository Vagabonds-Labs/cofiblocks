"use client";

import {
	CheckCircleIcon,
	ShoppingBagIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import type { OrderStatus } from "@prisma/client";
// import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
// import { ProductDetailsList } from "./ProductDetailsList";
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
	productImage?: string;
}

enum DeliveryTypeEnum {
	Meetup = "Meetup",
	Delivery = "Delivery",
}

// const _OrderStatusEnum = {
// 	PENDING: "PENDING",
// 	COMPLETED: "COMPLETED",
// 	CANCELLED: "CANCELLED",
// } as const;

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
		<div className="space-y-6">
			{/* Status Banner */}
			<div>
				<StatusBanner
					orderStatus={productDetails.status}
					isProducer={isProducer}
				/>
			</div>


			{/* Status Steps - Mobile Optimized */}
			<div className="flex items-center justify-between w-full space-x-2">
				{statusSteps.map((step, index) => {
					const Icon = stepIconMap[step as keyof typeof stepIconMap];
					const isCompleted = index <= currentStepIndex;
					const isActive = index === currentStepIndex;

					return (
						<div
							key={step}
							className={`flex flex-col items-center flex-1 ${
								isCompleted ? "text-green-600" : "text-gray-400"
							}`}
						>
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
									isActive
										? "bg-green-100"
										: isCompleted
											? "bg-green-50"
											: "bg-gray-100"
								}`}
							>
								<Icon className="w-5 h-5" />
							</div>
							<span className="text-xs text-center leading-tight">
								{t(`order_status.${step.toLowerCase()}`)}
							</span>
						</div>
					);
				})}
			</div>


			{/* Product Details - Mobile Optimized */}
			<div className="space-y-3">
				<h4 className="font-semibold text-content-title">{t("product")}</h4>
				<div className="grid grid-cols-1 gap-3">
					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-sm text-content-body-soft">{t("roast")}</span>
						<span className="text-sm font-medium text-content-title">{productDetails.roast}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-sm text-content-body-soft">{t("type")}</span>
						<span className="text-sm font-medium text-content-title">{productDetails.type}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-sm text-content-body-soft">{t("quantity")}</span>
						<span className="text-sm font-medium text-content-title">{productDetails.quantity}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-sm text-content-body-soft">{t("delivery")}</span>
						<span className="text-sm font-medium text-content-title">
							{productDetails.delivery === DeliveryTypeEnum.Delivery.toString()
								? t("my_home")
								: productDetails.delivery}
						</span>
					</div>
					<div className="flex justify-between items-center py-2">
						<span className="text-sm text-content-body-soft">{t("total_price")}</span>
						<span className="text-sm font-semibold text-content-title">{productDetails.totalPrice}</span>
					</div>
				</div>
			</div>

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
