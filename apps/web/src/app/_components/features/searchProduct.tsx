import InputField from "@repo/ui/form/inputField";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/trpc/react";
import type { Product } from "./types";

const searchSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be at most 50 characters"),
});

type formData = z.infer<typeof searchSchema>;

interface ProductComponentProp {
	products: Product[];
	setProducts: (newValue: Product[]) => void;
}

function ProductSearchBar({ products, setProducts }: ProductComponentProp) {
	// Local state to handle the search
	const [query, setQuery] = useState<string>("");
	const [quantityProducts, setQuantityProducts] = useState(0);
	const [originalProducts, setOriginalProducts] = useState<Product[]>([]);

	const { control } = useForm<formData>({
		defaultValues: {
			name: "",
		},
		mode: "onBlur",
	});

	const { data: productData } = api.product.searchProductCatalog.useQuery(
		{
			name: query,
		},
		{
			enabled: !!query, // Executed only when the query has a value
		},
	);

	useEffect(() => {
		if (products.length > 0 && originalProducts.length === 0) {
			setOriginalProducts(products);
		}
	}, [products, originalProducts]);

	// Update products when data is fetched or if search is empty
	useEffect(() => {
		if (productData && query) {
			setProducts(productData.productsFound);
			setQuantityProducts(productData.productsFound.length);
		} else if (!query && originalProducts.length > 0) {
			setProducts(originalProducts);
			setQuantityProducts(originalProducts.length);
		}
	}, [productData, query, originalProducts, setProducts]);

	const handleInputChange = (value: string) => {
		setQuery(value);
	};

	return (
		<div>
			<div className="flex items-center">
				<InputField<formData>
					name="name"
					control={control}
					label=""
					placeholder="Search for your coffee"
					onChange={(value) => handleInputChange(value)}
				/>
				{/* button for filter options
				 */}
			</div>

			<div>
				{query && quantityProducts > 0 ? (
					<div className="flex justify-between">
						<div>{quantityProducts} products found</div>
						<div>
							<div className="ml-3 underline cursor-pointer">Clear search</div>
						</div>
					</div>
				) : (
					query && <div className="text-center mt-4">No results</div>
				)}
			</div>
		</div>
	);
}

export default ProductSearchBar;
