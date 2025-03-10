import { FunnelIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@repo/ui/form/inputField";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	isLoadingAtom,
	quantityOfProducts,
	searchQueryAtom,
	searchResultsAtom,
} from "~/atoms/productAtom";
import { useTranslation } from "~/i18n";
import { api } from "~/trpc/react";
import FilterModal from "./FilterModal";

const searchSchema = z.object({
	region: z.string(),
});

type formData = z.infer<typeof searchSchema>;

const metadataSchema = z.object({
	process: z.string().optional(),
	region: z.string().optional(),
	farmName: z.string().optional(),
	strength: z.string().optional(),
});

type ProductMetadata = z.infer<typeof metadataSchema>;

const parseMetadata = (data: unknown): ProductMetadata => {
	try {
		if (typeof data === "string") {
			return metadataSchema.parse(JSON.parse(data));
		}
		return metadataSchema.parse(data);
	} catch {
		console.warn("Failed to parse metadata, using default values");
		return {
			process: undefined,
			region: undefined,
			farmName: undefined,
			strength: undefined,
		};
	}
};

export default function SearchBar() {
	const [query, setQuery] = useAtom(searchQueryAtom);
	const [, setSearchResults] = useAtom(searchResultsAtom);
	const [, setQuantityProducts] = useAtom(quantityOfProducts);
	const [, setIsLoading] = useAtom(isLoadingAtom);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const { t } = useTranslation();

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
			const productsWithProcess = data.productsFound.map((product) => {
				const metadata = parseMetadata(product.nftMetadata);

				return {
					...product,
					nftMetadata:
						typeof product.nftMetadata === "string"
							? product.nftMetadata
							: JSON.stringify(product.nftMetadata),
					process: metadata.process ?? t("natural_process"),
					region: metadata.region ?? "",
					farmName: metadata.farmName ?? "",
					strength: metadata.strength ?? "",
				};
			});
			setSearchResults(productsWithProcess);
			setQuantityProducts(productsWithProcess.length);
		} else {
			setSearchResults([]);
			setQuantityProducts(0);
		}
	}, [data, isLoading, setIsLoading, setQuantityProducts, setSearchResults, t]);

	const handleInputChange = (value: string) => {
		setQuery(value);
	};

	return (
		<>
			<div className="relative z-40">
				<div className="bg-white rounded-xl shadow-xl p-3 md:p-4">
					<div className="flex items-center gap-3">
						<InputField<formData>
							name="region"
							control={control}
							label=""
							placeholder={t("search_placeholder")}
							onChange={(value: string) => handleInputChange(value)}
							className="flex-1"
							showSearchIcon={true}
						/>
						<button
							type="button"
							onClick={() => setIsFilterOpen(true)}
							className="bg-surface-secondary-default p-3.5 rounded-lg hover:bg-surface-secondary-hover transition-colors flex-shrink-0"
							aria-label={t("open_filters")}
						>
							<FunnelIcon className="h-6 w-6" />
						</button>
					</div>
				</div>
			</div>
			<FilterModal
				isOpen={isFilterOpen}
				onClose={() => setIsFilterOpen(false)}
			/>
		</>
	);
}
