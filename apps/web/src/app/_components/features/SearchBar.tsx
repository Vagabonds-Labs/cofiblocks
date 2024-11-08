import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@repo/ui/form/inputField";
import { useAtom } from "jotai";
import { Filter } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	isLoadingAtom,
	quantityOfProducts,
	searchQueryAtom,
	searchResultsAtom,
} from "~/atoms/productAtom";
import { api } from "~/trpc/react";
import FilterModal from "./FilterModal";

const searchSchema = z.object({
	region: z.string(),
});

type formData = z.infer<typeof searchSchema>;

export default function SearchBar() {
	const [query, setQuery] = useAtom(searchQueryAtom);
	const [, setSearchResults] = useAtom(searchResultsAtom);
	const [, setQuantityProducts] = useAtom(quantityOfProducts);
	const [, setIsLoading] = useAtom(isLoadingAtom);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const { control } = useForm<formData>({
		resolver: zodResolver(searchSchema),
		defaultValues: { region: "" },
		mode: "onBlur",
	});

	const { data, isLoading } = api.product.searchProductCatalog.useQuery(
		{ region: query },
		{ enabled: !!query },
	);

	useEffect(() => {
		setIsLoading(isLoading);

		if (data?.productsFound) {
			setSearchResults(data.productsFound);
			setQuantityProducts(data.productsFound.length);
		} else {
			setSearchResults([]);
			setQuantityProducts(0);
		}
	}, [data, isLoading, setIsLoading, setQuantityProducts, setSearchResults]);

	const handleInputChange = (value: string) => {
		setQuery(value);
	};

	return (
		<>
			<div className=" flex justify-center items-center mb-5">
				<InputField<formData>
					name="region"
					control={control}
					label=""
					placeholder="Search for your coffee"
					onChange={(value: string) => handleInputChange(value)}
					className="gap-0 mr-3 w-3/4"
					showSearchIcon={true}
				/>
				<button
					type="button"
					onClick={() => setIsFilterOpen(true)}
					className="bg-surface-secondary-default p-3.5 rounded-lg"
				>
					<Filter size={24} />
				</button>
			</div>
			<FilterModal
				isOpen={isFilterOpen}
				onClose={() => setIsFilterOpen(false)}
			/>
		</>
	);
}
