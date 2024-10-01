import { motion } from "framer-motion";

function Particle({ delay }: { delay: number }) {
	return (
		<motion.div
			className="absolute w-1 h-1 bg-yellow-300 rounded-full"
			initial={{ opacity: 0, scale: 0 }}
			animate={{
				opacity: [0, 1, 0],
				scale: [0, 1.5, 0],
				top: ["50%", `${Math.random() * 40 + 30}%`],
				left: ["50%", `${Math.random() * 100}%`],
			}}
			transition={{ duration: 2, delay, ease: "easeOut" }}
		/>
	);
}

export default Particle;
