// Sun shape variant - starts at full size
export const sunShapeVariants = {
	initial: { scale: 1, opacity: 1, x: "-50%", y: "-50%", rotate: 0 },
	gather: {
		scale: 0.7,
		opacity: 1,
		x: "-50%",
		y: "-50%",
		rotate: 360,
		transition: { duration: 0.3, ease: "easeInOut" },
	},
	explode: (custom: {
		x: string;
		y: string;
		scale: number;
		rotate: number;
	}) => ({
		scale: custom.scale,
		opacity: 1,
		x: custom.x,
		y: custom.y,
		rotate: 0,
		transition: {
			type: "spring",
			stiffness: 150,
			damping: 10,
			duration: 0.6,
			bounce: 0.4,
		},
	}),
};

// Other shape variants - start smaller to hide behind the sun
export const shapeVariants = {
	initial: { scale: 0.5, opacity: 0.8, x: "-50%", y: "-50%", rotate: 0 },
	gather: {
		scale: 0.5,
		opacity: 1,
		x: "-50%",
		y: "-50%",
		rotate: 360,
		transition: { duration: 0.3, ease: "easeInOut" },
	},
	explode: (custom: {
		x: string;
		y: string;
		scale: number;
		rotate: number;
	}) => ({
		scale: custom.scale,
		opacity: 1,
		x: custom.x,
		y: custom.y,
		rotate: 0,
		transition: {
			type: "spring",
			stiffness: 150,
			damping: 10,
			duration: 0.6,
			bounce: 0.4,
		},
	}),
};

export const formContainerVariants = {
	initial: { height: 0 },
	visible: {
		height: "60%",
		transition: { duration: 0.1, ease: [0.65, 0, 0.35, 1] }, // Faster animation (0.2 → 0.1)
	},
};

export const formContentVariants = {
	initial: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.08, delay: 0.02 } }, // Faster animation (0.15 → 0.08, 0.05 → 0.02)
};

export const containerVariants = {
	initial: { backgroundColor: "var(--surface-primary-default)" },
	exploded: { backgroundColor: "var(--surface-primary-default)" },
};
