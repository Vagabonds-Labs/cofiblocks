"use client";

import Button from "@repo/ui/button";
import { H1, Text } from "@repo/ui/typography";
import {
	type Connector,
	useAccount,
	useConnect,
	useDisconnect,
	useSignTypedData,
} from "@starknet-react/core";
import { motion, useAnimation } from "framer-motion";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoginAnimation from "~/app/_components/ui/LoginAnimation";
import { MESSAGE } from "~/constants";
import {
	containerVariants,
	formContainerVariants,
	formContentVariants,
} from "~/utils/animationsConfig";

export default function LoginPage() {
	const [showForm, setShowForm] = useState(false);
	const controls = useAnimation();
	const backgroundControls = useAnimation();

	const { address } = useAccount();
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const { signTypedDataAsync } = useSignTypedData(MESSAGE);

	const handleConnectWallet = async (connector: Connector) => {
		if (connector) {
			connect({ connector });
		}
	};

	const handleSignMessage = async () => {
		try {
			const signature = await signTypedDataAsync();

			await signIn("credentials", {
				address,
				message: JSON.stringify(MESSAGE),
				redirect: false,
				signature,
			});
		} catch (err) {
			console.error("Error signing message:", err);
		}
	};

	const handleDisconnectWallet = () => {
		disconnect();
		void signOut();
	};

	useEffect(() => {
		const sequence = async () => {
			try {
				await controls.start("gather");
				await backgroundControls.start({
					scale: 1.1,
					transition: { duration: 0.3 },
				});
				await new Promise((resolve) => setTimeout(resolve, 200));
				await controls.start("explode");
				await backgroundControls.start({
					scale: 1,
					transition: { duration: 0.3 },
				});
				setShowForm(true);
			} catch (error) {
				console.error("Animation sequence error:", error);
			}
		};
		void sequence();
	}, [controls, backgroundControls]);

	return (
		<div className="bg-surface-primary-default flex items-center justify-center min-h-screen overflow-hidden">
			<motion.div
				className="w-[24.375rem] h-[52.75rem] bg-surface-primary-default relative overflow-hidden"
				variants={containerVariants}
				initial="initial"
				animate="exploded"
			>
				<LoginAnimation
					backgroundControls={backgroundControls}
					controls={controls}
				/>
				<motion.div
					className="absolute bottom-0 left-0 right-0 bg-surface-inverse rounded-t-3xl overflow-hidden"
					variants={formContainerVariants}
					initial="initial"
					animate={showForm ? "visible" : "initial"}
				>
					<motion.div
						className="p-6 space-y-6"
						variants={formContentVariants}
						initial="initial"
						animate={showForm ? "visible" : "initial"}
					>
						<div className="text-center">
							<Text className="text-content-title text-lg mt-2">
								Welcome to
							</Text>
							<H1 className="text-content-title">CofiBlocks</H1>
						</div>
						<div className="flex flex-col justify-center items-center space-y-4">
							{address ? (
								<>
									<Button
										onClick={handleSignMessage}
										variant="primary"
										size="lg"
										className="w-full max-w-[15rem] px-4 py-3  text-content-title text-base font-medium font-inter rounded-lg border border-surface-secondary-default transition-all duration-300 hover:bg-surface-secondary-hover"
									>
										Register
									</Button>
									<button
										onClick={handleDisconnectWallet}
										className="block text-center text-content-title text-base font-normal font-inter underline transition-colors duration-300 hover:text-content-title-hover"
										type="button"
									>
										Disconnect
									</button>
								</>
							) : (
								<>
									{connectors.map((connector) => (
										<Button
											key={connector.id}
											onClick={() => handleConnectWallet(connector)}
											variant="primary"
											size="lg"
											className="w-full max-w-[15rem] px-4 py-3  text-content-title text-base font-medium font-inter rounded-lg border border-surface-secondary-default transition-all duration-300 hover:bg-surface-secondary-hover"
										>
											<div className="flex items-center space-x-2">
												<span>Connect {connector.name}</span>
											</div>
										</Button>
									))}
								</>
							)}
						</div>
						<Link
							href="/sell"
							className="block text-center text-content-title text-base font-normal font-inter underline transition-colors duration-300 hover:text-content-title-hover"
						>
							Sell My Coffee
						</Link>
					</motion.div>
				</motion.div>
			</motion.div>
		</div>
	);
}
