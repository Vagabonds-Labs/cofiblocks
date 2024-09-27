import { FunnelIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@repo/ui/form/inputField";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Button from "@repo/ui/button";

const exampleSchema = z.object({
	name: z
		.string()
		.min(2, "Product name must be at least 2 characters")
		.max(50, "Name must be at most 50 characters"),
});

type ExampleFormData = z.infer<typeof exampleSchema>;

function ProductSearchBar() {
	const { control, handleSubmit } = useForm<ExampleFormData>({
		resolver: zodResolver(exampleSchema),
		defaultValues: {
			name: "",
		},
		mode: "onBlur",
	});

	return (
		<div className="flex items-center">
			<InputField<ExampleFormData>
				name="name"
				control={control}
				label=""
				placeholder="Search for your coffee"
			/>
			<Button className="ml-3" type="submit" variant="primary" size="lg">
				<FunnelIcon className="h-6 w-6" />
			</Button>
		</div>
	);
}

export default ProductSearchBar;
