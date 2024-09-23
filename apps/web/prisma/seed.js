import { PrismaClient } from "@prisma/client";

const coffeeCards = [
	{
		id: 1,
		title: "Café de Especialidad 1",
		description: "Descripción del Café de Especialidad 1.",
		imageUrl: "/images/cafe1.webp",
		imageAlt: "Paquete de Café de Especialidad 1",
		region: "Alajuela",
		farmName: "Beneficio Las Peñas",
		strength: "Light",
	},
	{
		id: 2,
		title: "Café de Especialidad 2",
		description: "Descripción del Café de Especialidad 2.",
		imageUrl: "/images/cafe2.webp",
		imageAlt: "Paquete de Café de Especialidad 2",
		region: "Cartago",
		farmName: "Beneficio Las Nubes",
		strength: "Medium",
	},
	{
		id: 3,
		title: "Café de Especialidad 3",
		description: "Descripción del Café de Especialidad 3.",
		imageUrl: "/images/cafe3.webp",
		imageAlt: "Paquete de Café de Especialidad 3",
		region: "Heredia",
		farmName: "Beneficio Monteverde",
		strength: "Strong",
	},
	{
		id: 4,
		title: "Café de Especialidad 4",
		description: "Descripción del Café de Especialidad 4.",
		imageUrl: "/images/cafe4.webp",
		imageAlt: "Paquete de Café de Especialidad 4",
		region: "Guanacaste",
		farmName: "Finca Santa Rosa",
		strength: "Light",
	},
	{
		id: 5,
		title: "Café de Especialidad 5",
		description: "Descripción del Café de Especialidad 5.",
		imageUrl: "/images/cafe5.webp",
		imageAlt: "Paquete de Café de Especialidad 5",
		region: "Puntarenas",
		farmName: "Finca El Mirador",
		strength: "Medium",
	},
];

const prisma = new PrismaClient();

async function main() {
	// Clean up existing data
	await prisma.orderItem.deleteMany();
	await prisma.order.deleteMany();
	await prisma.shoppingCartItem.deleteMany();
	await prisma.shoppingCart.deleteMany();
	await prisma.product.deleteMany();
	await prisma.user.deleteMany();

	// Insert new users with different roles
	const users = await Promise.all([
		prisma.user.create({
			data: {
				walletAddress: "0xUniqueWalletAddress1",
				phone: "123-456-7890",
				address: "123 User Street",
				name: "Alice",
				role: "COFFEE_BUYER",
			},
		}),
		prisma.user.create({
			data: {
				walletAddress: "0xUniqueWalletAddress2",
				phone: "987-654-3210",
				address: "456 Admin Avenue",
				name: "Bob",
				role: "ADMIN",
			},
		}),
		prisma.user.create({
			data: {
				walletAddress: "0xUniqueWalletAddress3",
				phone: "555-555-5555",
				address: "789 Farmer Lane",
				name: "Charlie",
				role: "COFFEE_PRODUCER",
			},
		}),
	]);

	// Insert new products with realistic prices
	const products = await Promise.all(
		coffeeCards.map((card, index) =>
			prisma.product.create({
				data: {
					name: card.title,
					price: 15.99 + index * 2, // Randomize price for realism
					region: card.region, // Add region
					farmName: card.farmName, // Add farm name
					strength: card.strength, // Add strength
					nftMetadata: JSON.stringify({
						description: card.description,
						imageUrl: card.imageUrl,
						imageAlt: card.imageAlt,
					}),
				},
			}),
		),
	);

	// Create shopping carts and orders for each user
	for (const user of users) {
		const cart = await prisma.shoppingCart.create({
			data: {
				userId: user.id,
				items: {
					create: [
						{ productId: products[0]?.id ?? 0, quantity: 1 },
						{ productId: products[1]?.id ?? 0, quantity: 2 },
					],
				},
			},
		});

		const order = await prisma.order.create({
			data: {
				userId: user.id,
				total: products[0]?.price ?? 0 + 2 * (products[1]?.price ?? 0),
				status: "PENDING",
				items: {
					create: [
						{
							productId: products[0]?.id ?? 0,
							quantity: 1,
							price: products[0]?.price ?? 0,
						},
						{
							productId: products[1]?.id ?? 0,
							quantity: 2,
							price: products[1]?.price ?? 0,
						},
					],
				},
			},
		});

		console.log(
			`Seed data inserted: Order ${order.id} created for ${user.name}, shopping cart ${cart.id} created for ${user.name}`,
		);
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
