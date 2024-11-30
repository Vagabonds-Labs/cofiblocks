import React from "react";

type ProductDetail = {
	label: string;
	value: string;
	address?: string;
};

type ProductDetailsListProps = {
	details: ProductDetail[];
};

export function ProductDetailsList({ details }: ProductDetailsListProps) {
	return (
		<div className="space-y-2">
			{details.map((item, index, array) => (
				<React.Fragment key={item.label}>
					<div className="flex justify-between items-start py-3">
						<div className="w-3/4">
							<p className="font-semibold">{item.label}</p>
							{item.address && (
								<p className="text-sm text-gray-500 mt-1 break-words">
									{item.address}
								</p>
							)}
						</div>
						<p className="w-1/2 text-right break-words">{item.value}</p>
					</div>
					{index < array.length - 1 && <hr className="my-1" />}
				</React.Fragment>
			))}
		</div>
	);
}
