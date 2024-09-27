import { motion } from "framer-motion";
import type { AnimationControls } from "framer-motion";
import Image from "next/image";

import Particle from "@repo/ui/particle";
import { shapeVariants } from "~/utils/animationsConfig";

type LoginAnimationProps = {
	backgroundControls: AnimationControls;
	controls: AnimationControls;
};

export default function LoginAnimation({
	backgroundControls,
	controls,
}: LoginAnimationProps) {
	return (
		<>
			<motion.div
				className="absolute inset-0 bg-success-default"
				animate={backgroundControls}
			/>

			{Array.from({ length: 20 }).map((_, i) => (
				<Particle key={`particle-${i + 1}`} delay={i * 0.03} />
			))}

			<motion.div
				className="absolute left-1/2 top-1/2"
				variants={shapeVariants}
				initial="initial"
				animate={controls}
				custom={{
					x: "calc(-90% - 2rem)",
					y: "calc(-280%)",
					scale: 1.2,
					rotate: -360,
				}}
			>
				<Image
					src="/images/splash/1.png"
					width={120}
					height={120}
					alt="Sun shape"
				/>
			</motion.div>
			<motion.div
				className="absolute left-1/2 top-1/2"
				variants={shapeVariants}
				initial="initial"
				animate={controls}
				custom={{
					x: "calc(90% + 2rem)",
					y: "calc(-280%)",
					scale: 1.1,
					rotate: 360,
				}}
			>
				<Image
					src="/images/splash/2.png"
					width={80}
					height={80}
					alt="Circle shape"
				/>
			</motion.div>
			<motion.div
				className="absolute left-1/2 top-1/2"
				variants={shapeVariants}
				initial="initial"
				animate={controls}
				custom={{
					x: "calc(-80%)",
					y: "calc(-180%)",
					scale: 1.3,
					rotate: -180,
				}}
			>
				<Image
					src="/images/splash/3.png"
					width={80}
					height={80}
					alt="Circle shape"
				/>
			</motion.div>
			<motion.div
				className="absolute left-1/2 top-1/2"
				variants={shapeVariants}
				initial="initial"
				animate={controls}
				custom={{ x: "calc(80%)", y: "calc(-180%)", scale: 1.2, rotate: 180 }}
			>
				<Image
					src="/images/splash/4.png"
					width={90}
					height={68}
					alt="Cup shape"
				/>
			</motion.div>
		</>
	);
}
