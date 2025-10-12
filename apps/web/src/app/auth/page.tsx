"use client";

import { motion, useAnimation } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import AuthForm from "~/app/_components/features/AuthForm";
import LoginAnimation from "~/app/_components/ui/LoginAnimation";
import {
	containerVariants,
	formContainerVariants,
} from "~/utils/animationsConfig";

function AuthPageContent() {
	const searchParams = useSearchParams();
	const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";

	const [showForm, setShowForm] = useState(false);
	const controls = useAnimation();
	const backgroundControls = useAnimation();

	useEffect(() => {
		const sequence = async () => {
			try {
				await controls.start("gather");
				await backgroundControls.start({
					scale: 1.1,
					transition: { duration: 0.3 },
				});
				// Removed the delay to make form appear faster
				await controls.start("explode");
				await backgroundControls.start({
					scale: 1,
					transition: { duration: 0.2 },
				});
				// Show form immediately after animation
				setShowForm(true);
			} catch (error) {
				console.error("Animation sequence error:", error);
			}
		};
		void sequence();
	}, [controls, backgroundControls]);

	return (
		<div className="bg-surface-primary-soft flex items-center justify-center min-h-screen h-screen w-screen overflow-hidden p-6">
			<motion.div
				className="w-[24.375rem] h-[52.75rem] bg-surface-primary-default relative overflow-hidden rounded-2xl shadow-xl border border-surface-border"
				variants={containerVariants}
				initial="initial"
				animate="exploded"
			>
				<LoginAnimation
					backgroundControls={backgroundControls}
					controls={controls}
				/>

				{/* White area for form */}
				<motion.div
					className="absolute bottom-0 left-0 right-0 bg-surface-inverse rounded-t-3xl overflow-hidden shadow-md"
					variants={formContainerVariants}
					initial="initial"
					animate={showForm ? "visible" : "initial"}
				>
					<AuthForm initialMode={mode} />
				</motion.div>
			</motion.div>
		</div>
	);
}

export default function AuthPage() {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
			<AuthPageContent />
		</Suspense>
	);
}
