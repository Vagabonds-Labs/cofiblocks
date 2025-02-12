import { XMarkIcon } from "@heroicons/react/24/outline";
import type { JsonValue } from "@prisma/client/runtime/library";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "~/trpc/react";

interface FilterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onApplyFilters: (products: FilteredProduct[]) => void;
}

interface NftMetadata {
	description: string;
	imageUrl?: string;
	imageAlt?: string;
	region?: string;
	farmName?: string;
	strength?: string;
}

interface FilteredProduct {
	id: number;
	tokenId: number;
	name: string;
	price: number;
	nftMetadata: JsonValue;
	createdAt: Date;
	updatedAt: Date;
	region: string;
	strength: string;
}

export default function FilterModal({
	isOpen,
	onClose,
	onApplyFilters,
}: FilterModalProps) {
	const { t } = useTranslation();
	const [selectedStrength, setSelectedStrength] = useState<string>("");
	const [selectedRegion, setSelectedRegion] = useState<string>("");
	const [selectedOrder, setSelectedOrder] = useState<string>("");
	const [searchResults, setSearchResults] = useState<FilteredProduct[]>([]);
	const [quantityProducts, setQuantityProducts] = useState<number>(0);

	const { data, refetch } = api.product.filterProducts.useQuery({
		strength: selectedStrength,
		region: selectedRegion,
		orderBy: selectedOrder,
	});

	useEffect(() => {
		if (data) {
			const products = data.productsFound.map((product) => {
				let metadata: NftMetadata = {
					description: "",
					imageUrl: "",
					imageAlt: "",
					region: "",
					farmName: "",
					strength: "",
				};
				try {
					if (typeof product.nftMetadata === "string") {
						metadata = JSON.parse(product.nftMetadata) as NftMetadata;
					} else if (
						product.nftMetadata &&
						typeof product.nftMetadata === "object"
					) {
						metadata = product.nftMetadata as unknown as NftMetadata;
					}
				} catch (error) {
					console.error("Error parsing metadata:", error);
				}
				return {
					...product,
					region: metadata.region ?? "",
					strength: metadata.strength ?? "",
				};
			});
			setSearchResults(products);
			setQuantityProducts(products.length);
		}
	}, [data]);

	const handleApplyFilters = () => {
		onApplyFilters(searchResults);
		onClose();
	};

	const handleClearFilters = () => {
		setSelectedStrength("");
		setSelectedRegion("");
		setSelectedOrder("");
		void refetch();
	};

	if (!isOpen) return null;

	const hasActiveFilters = selectedStrength || selectedRegion || selectedOrder;

	const strengthOptions = Object.keys(
		t("strength", { returnObjects: true }) as Record<string, string>,
	);
	const regionOptions = Object.keys(
		t("regions", { returnObjects: true }) as Record<string, string>,
	);
	const orderOptions = Object.keys(
		t("order", { returnObjects: true }) as Record<string, string>,
	);

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
								onClick={handleClearFilters}
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
						<h3 className="font-medium">{t("strength")}</h3>
						<div className="space-y-2">
							{strengthOptions.map((strength) => (
								<label
									key={strength}
									className="flex items-center space-x-2 py-3 border-b"
								>
									<input
										type="radio"
										name="strength"
										checked={selectedStrength === strength}
										onChange={() => setSelectedStrength(strength)}
										className="w-5 h-5 rounded mr-1"
									/>
									<span>{t(`strength.${strength}`)}</span>
								</label>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<h3 className="font-medium">{t("region")}</h3>
						<div className="space-y-2">
							{regionOptions.map((region) => (
								<label
									key={region}
									className="flex items-center space-x-2 py-3 border-b"
								>
									<input
										type="radio"
										name="region"
										checked={selectedRegion === region}
										onChange={() => setSelectedRegion(region)}
										className="w-5 h-5 rounded mr-1"
									/>
									<span>{t(`regions.${region}`)}</span>
								</label>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<h3 className="font-medium">{t("order_by")}</h3>
						<div className="space-y-2">
							{orderOptions.map((order) => (
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
									<span>{t(`order.${order}`)}</span>
								</label>
							))}
						</div>
					</div>
				</div>

				<div className="p-4 sticky bottom-0 bg-white">
					<button
						type="button"
						onClick={handleApplyFilters}
						className="w-full bg-surface-secondary-default text-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
					>
						{t("products_found", {
							count: quantityProducts,
						})}
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
