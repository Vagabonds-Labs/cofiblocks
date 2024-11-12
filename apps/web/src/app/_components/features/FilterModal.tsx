import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useState } from "react";
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

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
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
				setSearchResults(data.productsFound);
				setQuantityProducts(data.productsFound.length);
			} else {
				setSearchResults([]);
				setQuantityProducts(0);
			}
		} catch (error) {
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
						<h2 className="text-xl font-semibold">Filter by</h2>
						{hasActiveFilters && (
							<button
								type="button"
								onClick={handleClear}
								className="text-gray-500 hover:text-gray-700"
							>
								Clear
							</button>
						)}
					</div>
					<button onClick={onClose} className="p-1" type="button">
						<XMarkIcon className="h-6 w-6" />
					</button>
				</div>

				<div className="p-4 space-y-6 overflow-y-auto">
					<div className="space-y-3">
						<h3 className="font-medium">Roast level</h3>
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
									<span>{strength}</span>
								</label>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<h3 className="font-medium">Region</h3>
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
									<span>{region}</span>
								</label>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<h3 className="font-medium">Order by</h3>
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
									<span>{order}</span>
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
						Apply
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
