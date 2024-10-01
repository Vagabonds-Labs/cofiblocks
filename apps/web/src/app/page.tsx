"use client";

<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { H1, Text } from "@repo/ui/typography"
import { useConnect } from '@starknet-react/core'
import Button from "@repo/ui/button"
import { trpc } from '~/utils/trpc'
import { connect } from "starknetkit"
=======
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
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
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
	const [isClient, setIsClient] = useState(false);
>>>>>>> 752680a5b5f3fab3a993aec764e691bad9e177fa

const { address } = useAccount();
const { data: session } = useSession();
const { connect, connectors } = useConnect();
const { disconnect } = useDisconnect();
const { signTypedDataAsync } = useSignTypedData(MESSAGE);

const handleConnectWallet = async (connector: Connector) => {
  if (connector) {
    connect({ connector });
  }
};

<<<<<<< HEAD
export default function AnimatedLoginPage() {
  const [showForm, setShowForm] = useState(false)
  const [nfts, setNfts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const controls = useAnimation()
  const backgroundControls = useAnimation()
  const { connectors } = useConnect()

  useEffect(() => {
    async function fetchNFTs() {
      try {
        const fetchedNFTs = await trpc.nft.getUserNFTs.query({ userId: 'sample-user-id' }); // Replace with real userId
        setNfts(fetchedNFTs);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNFTs();
  }, []);

  useEffect(() => {
    const sequence = async () => {
      try {
        await controls.start("gather")
        await backgroundControls.start({ scale: 1.1, transition: { duration: 0.3 } })
        await new Promise(resolve => setTimeout(resolve, 200))
        await controls.start("explode")
        await backgroundControls.start({ scale: 1, transition: { duration: 0.3 } })
        setShowForm(true)
      } catch (error) {
        console.error("Animation sequence error:", error)
      }
    }
    void sequence()
  }, [controls, backgroundControls])
=======
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
>>>>>>> 752680a5b5f3fab3a993aec764e691bad9e177fa

  const handleDisconnectWallet = () => {
    disconnect();
    void signOut();
  };

<<<<<<< HEAD
  const shapeVariants = {
    initial: { scale: 1, opacity: 1, x: '-50%', y: '-50%', rotate: 0 },
    gather: {
      scale: 0.5,
      opacity: 1,
      x: '-50%',
      y: '-50%',
      rotate: 360,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    explode: (custom: { x: string, y: string, scale: number, rotate: number }) => ({
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
        bounce: 0.4
      }
    })
  }
=======
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
>>>>>>> 752680a5b5f3fab3a993aec764e691bad9e177fa

  useEffect(() => {
    if (session && address) {
      redirect("/marketplace");
    }
  }, [session, address]);

  useEffect(() => {
    setIsClient(true);
  }, []);

<<<<<<< HEAD
  return (
    <div className="bg-surface-primary-default flex items-center justify-center min-h-screen overflow-hidden">
      <motion.div
        className="w-[24.375rem] h-[52.75rem] bg-surface-primary-default relative overflow-hidden"
        variants={containerVariants}
        initial="initial"
        animate="exploded"
      >
        <motion.div
          className="absolute inset-0 bg-success-default"
          animate={backgroundControls}
        />

        {/* Particles */}
        <AnimatePresence>
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={`particle-${i + 1}`} delay={i * 0.03} />
          ))}
        </AnimatePresence>

        {/* Exploding shapes */}

        <motion.div
          className="absolute left-1/2 top-1/2"
          variants={shapeVariants}
          initial="initial"
          animate={controls}
          custom={{ x: 'calc(-90% - 2rem)', y: 'calc(-280%)', scale: 1.2, rotate: -360 }}
        >
          <Image src="/images/splash/1.png" width={120} height={120} alt="Sun shape" />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2"
          variants={shapeVariants}
          initial="initial"
          animate={controls}
          custom={{ x: 'calc(90% + 2rem)', y: 'calc(-280%)', scale: 1.1, rotate: 360 }}
        >
          <Image src="/images/splash/2.png" width={80} height={80} alt="Circle shape" />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2"
          variants={shapeVariants}
          initial="initial"
          animate={controls}
          custom={{ x: 'calc(-80%)', y: 'calc(-180%)', scale: 1.3, rotate: -180 }}
        >
          <Image src="/images/splash/3.png" width={80} height={80} alt="Circle shape" />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2"
          variants={shapeVariants}
          initial="initial"
          animate={controls}
          custom={{ x: 'calc(80%)', y: 'calc(-180%)', scale: 1.2, rotate: 180 }}
        >
          <Image src="/images/splash/4.png" width={90} height={68} alt="Cup shape" />
        </motion.div>

        {/* NFT Display */}
        <div className="p-4">
          <H1 className="text-content-title mb-4">Your NFTs</H1>
          {loading ? (
            <p>Loading NFTs...</p>
          ) : nfts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {nfts.map((nft) => (
                <div key={nft.id} className="border p-2 rounded">
                  <Image src={nft.imageUrl} alt={nft.name} width={100} height={100} />
                  <Text>{nft.name}</Text>
                  <Text>{nft.description}</Text>
                </div>
              ))}
            </div>
          ) : (
            <p>You don't own any NFTs yet.</p>
          )}
        </div>

        {/* White area for form */}
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
              <Text className="text-content-title text-lg mt-2">Welcome to</Text>
              <H1 className="text-content-title">CofiBlocks</H1>
            </div>
            <div className="flex justify-center items-center">
              {connectors.map((connector) => (
                <Button key={connector.id} onClick={() => connect()} variant="secondary" size="lg" className="w-full max-w-[15rem] px-4 py-3 bg-surface-secondary-default text-content-title text-base font-medium font-inter rounded-lg border border-surface-secondary-default transition-all duration-300 hover:bg-surface-secondary-hover">
                  <div className="flex items-center space-x-2">
                    <span>Login</span>
                  </div>
                </Button>
              ))}
            </div>

            <Link href="/sell" className="block text-center text-content-title text-base font-normal font-inter underline transition-colors duration-300 hover:text-content-title-hover">
              Sell My Coffee
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
=======
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
										Sign
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
									{isClient && (
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
														<span>
															Connect{" "}
															{connector.id === "argentX"
																? "Argent X"
																: connector.name}
														</span>
													</div>
												</Button>
											))}
										</>
									)}
								</>
							)}
						</div>
						{/* <Link
							href="/sell"
							className="block text-center text-content-title text-base font-normal font-inter underline transition-colors duration-300 hover:text-content-title-hover"
						>
							Sell My Coffee
						</Link> */}
					</motion.div>
				</motion.div>
			</motion.div>
		</div>
	);
}
>>>>>>> 752680a5b5f3fab3a993aec764e691bad9e177fa
