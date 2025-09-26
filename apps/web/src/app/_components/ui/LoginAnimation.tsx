"use client";

import { motion } from "framer-motion";
import type { AnimationControls } from "framer-motion";
import Image from "next/image";

import Particle from "@repo/ui/particle";
import { shapeVariants, sunShapeVariants } from "~/utils/animationsConfig";

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
				className="absolute inset-0 bg-success-default z-0"
				animate={backgroundControls}
			/>

			{/* Sun shape - placed first to appear at the front */}
			<motion.div
				className="absolute left-1/2 top-1/2 z-10"
				variants={sunShapeVariants}
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
					width={140}
					height={140}
					alt="Sun shape"
				/>
			</motion.div>

			{/* Particles */}
			{Array.from({ length: 20 }).map((_, i) => (
				<Particle key={`particle-${i + 1}`} delay={i * 0.03} />
			))}
			<motion.div
				className="absolute left-1/2 top-1/2 z-[5]"
				variants={shapeVariants}
				initial="initial"
				animate={controls}
				custom={{
					x: "calc(77% + 2rem)",
					y: "calc(-400%)",
					scale: 1.1,
					rotate: 360,
				}}
			>
				<Image
					src="/images/splash/2.png"
					width={90}
					height={90}
					alt="Circle shape"
				/>
			</motion.div>
			<motion.div
				className="absolute left-1/2 top-1/2 z-[3]"
				variants={shapeVariants}
				initial="initial"
				animate={controls}
				custom={{
					x: "calc(-120%)",
					y: "calc(-210%)",
					scale: 1.3,
					rotate: -180,
				}}
			>
				<Image
					src="/images/splash/4.png"
					width={100}
					height={100}
					alt="Circle shape"
				/>
			</motion.div>
			<motion.div
				className="absolute left-1/2 top-1/2 z-[7]"
				variants={shapeVariants}
				initial="initial"
				animate={controls}
				custom={{ x: "calc(50%)", y: "calc(-220%)", scale: 1.2, rotate: 180 }}
			>
				<Image
					src="/images/splash/3.png"
					width={100}
					height={100}
					alt="Cup shape"
				/>
			</motion.div>
		</>
	);
}
