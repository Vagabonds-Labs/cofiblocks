//This ProductCard component displays product details in a card format
import { ProductCard } from "@repo/ui/productCard";
import type { Meta, StoryFn } from "@storybook/react";

//This meta object configures the ProductCard for Storybook
export default {
	title: "Components/ProductCard", //organizes components under the "ProductCard component"
	tags: ["autodocs"], //automates documentation generation
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

//This implements the default Product Card
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

//This implements the Product On Sale
export const OnSale = Template.bind({});
OnSale.args = {
	...Default.args,
	badgeText: "On Sale",
	price: 20,
};

//This implements the Featured Card
export const Featured = Template.bind({});
Featured.args = {
	...Default.args,
	badgeText: "Featured",
	variety: "Geisha Coffee",
};

//This implements a card without an image
export const NoImage = Template.bind({});
NoImage.args = {
	...Default.args,
	image: "",
};

//This implements how to add to Cart
export const AddToCart = Template.bind({});
AddToCart.args = {
	...Default.args,
	badgeText: "Best Seller",
	onAddToCart: () => alert("Item added to cart"),
};

//Usage Examples
//Basic Product Card
<ProductCard
	image="https://via.placeholder.com/358x188"
	region="Ethiopia"
	farmName="Sunrise Farms"
	variety="Arabica Coffee"
	price={25}
	badgeText="New Arrival"
	onClick={() => alert("View product details")}
/>;

//Product On Sale
<ProductCard
	image="https://via.placeholder.com/358x188"
	region="Ethiopia"
	farmName="Sunrise Farms"
	variety="Arabica Coffee"
	price={20}
	badgeText="On Sale"
	onClick={() => alert("View product details")}
/>;

//In the aria attributes and accessibilities,
// You can add a [role="status"] and [aria-live="polite"] attribute to the badge element to announce status
//  changes to users. Example;
<span role="status" aria-live="polite">
	New Arrival
</span>;
// You should use meaningful alt text for the product image.
// If the image is decorative or missing, provide an empty alt="".
<img
	src="https://via.placeholder.com/358x188"
	alt="Arabica Coffee from Sunrise Farms"
/>;
