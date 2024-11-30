import { ProductCard } from "@repo/ui/productCard";
import type { Meta, StoryFn } from "@storybook/react";

export default {
	title: "Components/ProductCard",
	tags: ["autodocs"],
	component: ProductCard,
	argTypes: {
		image: {
			control: "text",
			description: "The image URL of the product",
		},
		region: {
			control: "text",
			description: "The region where the product is produced",
		},
		farmName: {
			control: "text",
			description: "The name of the farm",
		},
		variety: {
			control: "text",
			description: "The variety of the product",
		},
		price: {
			control: "number",
			description: "The price of the product per unit",
		},
		badgeText: {
			control: "text",
			description: "The text displayed on the badge",
		},
		onClick: {
			action: "onClick",
			description: "Callback when the card action button is clicked",
		},
		onAddToCart: {
			action: "onAddToCart",
			description: "Callback when the 'Add to Cart' button is clicked",
		},
		isAddingToShoppingCart: {
			control: "boolean",
			description: "Indicates if the item is being added to the shopping cart",
		},
	},
} as Meta<typeof ProductCard>;

const Template: StoryFn<typeof ProductCard> = (args) => (
	<ProductCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
	image: "https://via.placeholder.com/358x188",
	region: "Ethiopia",
	farmName: "Sunrise Farms",
	variety: "Arabica Coffee",
	price: 25,
	badgeText: "New Arrival",
	onClick: () => alert("View product details"),
};

export const OnSale = Template.bind({});
OnSale.args = {
	...Default.args,
	badgeText: "On Sale",
	price: 20,
};

export const Featured = Template.bind({});
Featured.args = {
	...Default.args,
	badgeText: "Featured",
	variety: "Geisha Coffee",
};

export const NoImage = Template.bind({});
NoImage.args = {
	...Default.args,
	image: "",
};

export const AddToCart = Template.bind({});
AddToCart.args = {
	...Default.args,
	badgeText: "Best Seller",
	onAddToCart: () => alert("Item added to cart"),
};
