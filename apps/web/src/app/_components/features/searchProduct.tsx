import { FunnelIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@repo/ui/button";
import InputField from "@repo/ui/form/inputField";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/trpc/react";
import type { Product } from "./types";

// Esquema de validación
const searchSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be at most 50 characters"),
});

type formData = z.infer<typeof searchSchema>;

interface ProductComponentProp {
	products: Product[]; // Definir el tipo de prop
	setProducts: (newValue: Product[]) => void;
}

function ProductSearchBar({ products, setProducts }: ProductComponentProp) {
	// Local state to handle the search
	const [query, setQuery] = useState<string>("");

	// Local state to store the quantity of products finded
	const [quantityProducts, setQuantityProducts] = useState(0);

	// Local state to store the original list of products
	const [originalProducts, setOriginalProducts] = useState<Product[]>([]);

	// Hook to manage the form
	const { control, handleSubmit } = useForm<formData>({
		defaultValues: {
			name: "",
		},
		mode: "onBlur",
	});

	// Hook to run the search
	const { data: productData } = api.product.searchProductCatalog.useQuery(
		{
			name: query,
		},
		{
			enabled: !!query, // Executed only when the query has a value
		},
	);

	// Save the original list of products only the first time the component is loaded
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

	// Function to clear the search and restore the original list of products
	const onClear = () => {
		setQuery("");
		// Restore the original list of products
		setProducts(originalProducts);
	};

	// Función para manejar el evento onChange
	const handleInputChange = (value: string) => {
		// Update the state with the value of the input
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
