import React from "react";
import  Card  from "~/app/_components/ui/Card";
import { api } from "~/trpc/react";

const coffeeCards = [
  {
    id: 1,
    title: "Café de Especialidad 1",
    description: "Descripción del Café de Especialidad 1.",
    imageUrl: "/images/cafe1.webp",
    imageAlt: "Paquete de Café de Especialidad 1",
  },
  {
    id: 2,
    title: "Café de Especialidad 2",
    description: "Descripción del Café de Especialidad 2.",
    imageUrl: "/images/cafe2.webp",
    imageAlt: "Paquete de Café de Especialidad 2",
  },
  {
    id: 3,
    title: "Café de Especialidad 3",
    description: "Descripción del Café de Especialidad 3.",
    imageUrl: "/images/cafe3.webp",
    imageAlt: "Paquete de Café de Especialidad 3",
  },
  {
    id: 4,
    title: "Café de Especialidad 4",
    description: "Descripción del Café de Especialidad 4.",
    imageUrl: "/images/cafe4.webp",
    imageAlt: "Paquete de Café de Especialidad 4",
  },
  {
    id: 5,
    title: "Café de Especialidad 5",
    description: "Descripción del Café de Especialidad 5.",
    imageUrl: "/images/cafe5.webp",
    imageAlt: "Paquete de Café de Especialidad 5",
  },
  {
    id: 6,
    title: "Café de Especialidad 3",
    description: "Descripción del Café de Especialidad 3.",
    imageUrl: "/images/cafe3.webp",
    imageAlt: "Paquete de Café de Especialidad 3",
  },
  {
    id: 7,
    title: "Café de Especialidad 4",
    description: "Descripción del Café de Especialidad 4.",
    imageUrl: "/images/cafe4.webp",
    imageAlt: "Paquete de Café de Especialidad 4",
  },
  {
    id: 8,
    title: "Café de Especialidad 5",
    description: "Descripción del Café de Especialidad 5.",
    imageUrl: "/images/cafe5.webp",
    imageAlt: "Paquete de Café de Especialidad 5",
  },
];

export default function ProductCatalog() {


  const [addedProduct, setAddedProduct] = React.useState<number | null>(null);

  const utils = api.useUtils();

  const { mutate : addItem } = api.shoppingCart.addItem.useMutation({
    onSuccess: async () => {
      await utils.shoppingCart.getItems.invalidate();
      setAddedProduct(null);
    }
  });

  const handleAddToCart = (productId: number) => {
    const cartId = 1;

    addItem({ cartId, productId, quantity: 1});
    setAddedProduct(productId);

  }

  return (
    <div className="grid grid-cols-1 gap-10 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {coffeeCards.map(({ id, title, description, imageUrl, imageAlt }) => (
        <div key={id}>
          <Card
            title={title}
            description={description}
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            price="10.00"
            productId={String(addedProduct)}
            onClick={() => handleAddToCart(id)}
            isAddingToShoppingCart={addedProduct === id}
          />
        </div>
      ))}
    </div>
  );
}