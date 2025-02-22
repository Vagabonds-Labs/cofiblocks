import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	isLoadingAtom,
	quantityOfProducts,
	searchResultsAtom,
} from "~/atoms/productAtom";
import { api } from "~/trpc/react";

interface FilterModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface ProductMetadata {
	region?: string;
	farmName?: string;
	strength?: string;
	imageUrl?: string;
	imageAlt?: string;
	description?: string;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
	const { t } = useTranslation();
	const [selectedStrength, setSelectedStrength] = useState("");
	const [selectedRegion, setSelectedRegion] = useState("");
	const [selectedOrder, setSelectedOrder] = useState("");
	const [, setSearchResults] = useAtom(searchResultsAtom);
	const [, setQuantityProducts] = useAtom(quantityOfProducts);
	const [, setIsLoading] = useAtom(isLoadingAtom);

	const { refetch } = api.product.filterProducts.useQuery(
		{
			strength: selectedStrength || undefined,
			region: selectedRegion || undefined,
			orderBy: selectedOrder || undefined,
		},
		{
			enabled: false,
		},
	);

	const handleApply = async () => {
		setIsLoading(true);
		try {
			const { data } = await refetch();

			if (data?.productsFound) {
				const products = data.productsFound.map((product) => {
					const metadata: ProductMetadata =
						typeof product.nftMetadata === "string"
							? (JSON.parse(product.nftMetadata) as ProductMetadata)
							: (product.nftMetadata as ProductMetadata);
					return {
						...product,
						nftMetadata:
							typeof product.nftMetadata === "string"
								? product.nftMetadata
								: JSON.stringify(product.nftMetadata),
						region: metadata.region ?? "",
						farmName: metadata.farmName ?? "",
						strength: metadata.strength ?? "",
					};
				});
				setSearchResults(products);
				setQuantityProducts(products.length);
			} else {
				setSearchResults([]);
				setQuantityProducts(0);
			}
		} catch (error) {
			console.error(error);
			setSearchResults([]);
			setQuantityProducts(0);
		} finally {
			setIsLoading(false);
			onClose();
		}
	};

	const handleClear = () => {
		setSelectedStrength("");
		setSelectedRegion("");
		setSelectedOrder("");
		setSearchResults([]);
		setQuantityProducts(0);
	};

	if (!isOpen) return null;

	const hasActiveFilters = selectedStrength || selectedRegion || selectedOrder;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-5 overflow-y-auto"
			onClick={onClose}
		>
			<motion.div
				initial={{ y: 50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 50, opacity: 0 }}
				className="bg-white rounded-lg w-full max-w-md mx-4 my-5 flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-4 flex justify-between items-center top-0 bg-white z-10">
					<div className="flex justify-between items-center gap-4">
						<h2 className="text-xl font-semibold">{t("filter_by")}</h2>
						{hasActiveFilters && (
							<button
								type="button"
								onClick={handleClear}
								className="text-gray-500 hover:text-gray-700"
							>
								{t("clear")}
							</button>
						)}
					</div>
					<button onClick={onClose} className="p-1" type="button">
						<XMarkIcon className="h-6 w-6" />
					</button>
				</div>

				<div className="p-4 space-y-6 overflow-y-auto">
					<div className="space-y-3">
						<h3 className="font-medium">{t("roast_level")}</h3>
						<div className="space-y-2">
							{["Light", "Medium", "Strong"].map((strength) => (
								<label
									key={strength}
									className="flex items-center space-x-2 py-3 border-b"
								>
									<input
										type="checkbox"
										checked={selectedStrength === strength}
										onChange={() =>
											setSelectedStrength(
												selectedStrength === strength ? "" : strength,
											)
										}
										className="w-5 h-5 rounded mr-1"
									/>
									<span>{t(`strength.${strength.toLowerCase()}`)}</span>
								</label>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<h3 className="font-medium">{t("region")}</h3>
						<div className="space-y-2">
							{["Region A", "Region B", "Region C"].map((region) => (
								<label
									key={region}
									className="flex items-center space-x-2 py-3 border-b"
								>
									<input
										type="checkbox"
										checked={selectedRegion === region}
										onChange={() =>
											setSelectedRegion(selectedRegion === region ? "" : region)
										}
										className="w-5 h-5 rounded mr-1"
									/>
									<span>
										{t(`regions.${region.replace(" ", "_").toLowerCase()}`)}
									</span>
								</label>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<h3 className="font-medium">{t("order_by")}</h3>
						<div className="space-y-2">
							{["Highest price", "Lowest price"].map((order) => (
								<label
									key={order}
									className="flex items-center space-x-2 py-3 border-b"
								>
									<input
										type="radio"
										name="orderBy"
										checked={selectedOrder === order}
										onChange={() => setSelectedOrder(order)}
										className="w-5 h-5 rounded mr-1"
									/>
									<span>
										{t(`order.${order.toLowerCase().replace(" ", "_")}`)}
									</span>
								</label>
							))}
						</div>
					</div>
				</div>

				<div className="p-4 sticky bottom-0 bg-white">
					<button
						type="button"
						onClick={handleApply}
						className="w-full bg-surface-secondary-default text-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
					>
						{t("apply")}
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
