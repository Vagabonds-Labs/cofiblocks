import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@repo/ui/form/inputField";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	isLoadingAtom,
	quantityOfProducts,
	searchQueryAtom,
	searchResultsAtom,
} from "~/atoms/productAtom";
import { api } from "~/trpc/react";

const searchSchema = z.object({
	region: z.string(),
});

type formData = z.infer<typeof searchSchema>;

export default function SearchBar() {
	const [query, setQuery] = useAtom(searchQueryAtom);
	const [, setSearchResults] = useAtom(searchResultsAtom);
	const [, setQuantityProducts] = useAtom(quantityOfProducts);
	const [, setIsLoading] = useAtom(isLoadingAtom);

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
			const productsWithProcess = data.productsFound.map((product) => ({
				...product,
				process: product.process ?? "Natural",
			}));
			setSearchResults(productsWithProcess);
			setQuantityProducts(productsWithProcess.length);
		} else {
			setSearchResults([]);
			setQuantityProducts(0);
		}
	}, [data, isLoading, setIsLoading, setQuantityProducts, setSearchResults]);

	const handleInputChange = (value: string) => {
		setQuery(value);
	};

	return (
		<div className="mb-2">
			<InputField<formData>
				name="region"
				control={control}
				label=""
				placeholder="Search for your coffee"
				onChange={(value: string) => handleInputChange(value)}
			/>
		</div>
	);
}
