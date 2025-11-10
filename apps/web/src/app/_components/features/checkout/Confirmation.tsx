"use client";

import { 
	ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { CartItem } from "~/store/cartAtom";

interface ConfirmationProps {
	cartItems?: CartItem[];
}

const getImageUrl = (src: string) => {
	const IPFS_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";
	
	if (src.startsWith("Qm")) {
		return `${IPFS_GATEWAY_URL}${src}`;
	}
	if (src.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY_URL}${src.replace("ipfs://", "")}`;
	}
	if (
		src.startsWith("http://") ||
		src.startsWith("https://") ||
		src.startsWith("/")
	) {
		return src;
	}
	return "/images/cafe1.webp"; // Fallback image
};

export default function Confirmation({ cartItems = [] }: ConfirmationProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const shareableContentRef = useRef<HTMLDivElement>(null);
	const [isGeneratingImage, setIsGeneratingImage] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Detect mobile screen size
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		
		checkMobile();
		window.addEventListener("resize", checkMobile);
		
		return () => {
			window.removeEventListener("resize", checkMobile);
		};
	}, []);

	// Bilingual share text (English and Spanish)
	const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
	const shareTextEn = `Just purchased amazing coffee from Costa Rica on CofiBlocks! Supporting small coffee producers directly. #CoffeeLover ${shareUrl}`;
	const shareTextEs = `¡Acabo de comprar café increíble de Costa Rica en CofiBlocks! Apoyando directamente a pequeños productores de café. #AmanteDelCafé ${shareUrl}`;
	const shareText = `${shareTextEn}\n\n${shareTextEs}`;
	const hashtags = "CoffeeLover,CofiBlocks,CostaRica,AmanteDelCafé";

	// Generate shareable image
	const generateShareImage = async (): Promise<File | null> => {
		if (!shareableContentRef.current) {
			console.error("shareableContentRef is null");
			return null;
		}

		console.log("Starting image generation...");
		setIsGeneratingImage(true);
		
		try {
			// Wait a bit for images to load - increase delay for better reliability
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Dynamically import html2canvas
			const html2canvas = (await import("html2canvas")).default;
			console.log("html2canvas imported successfully");
			
			const element = shareableContentRef.current;
			if (!element) {
				setIsGeneratingImage(false);
				return null;
			}
			
			// Temporarily move element to body to avoid style inheritance issues
			const originalParent = element.parentNode;
			const originalNextSibling = element.nextSibling;
			
			// Create a clean container that won't inherit problematic styles
			const cleanContainer = document.createElement("div");
			cleanContainer.style.cssText = "position:absolute;left:-9999px;top:0;background:#ffffff;";
			document.body.appendChild(cleanContainer);
			cleanContainer.appendChild(element);
			
			try {
				const canvas = await html2canvas(element, {
					backgroundColor: "#ffffff",
					scale: 2,
					useCORS: true,
					logging: false,
					allowTaint: false,
					removeContainer: false,
					imageTimeout: 15000,
					onclone: (clonedDoc) => {
						// Remove all style and link tags that might contain oklch
						const styleTags = clonedDoc.querySelectorAll("style, link[rel='stylesheet']");
						for (const styleTag of styleTags) {
							styleTag.remove();
						}
					},
				});
				
				console.log("Canvas generated:", canvas.width, "x", canvas.height);
				
				// Move element back to original position
				if (originalNextSibling && originalParent) {
					originalParent.insertBefore(element, originalNextSibling);
				} else if (originalParent) {
					originalParent.appendChild(element);
				}
				if (cleanContainer.parentNode) {
					document.body.removeChild(cleanContainer);
				}
				
				return new Promise<File | null>((resolve) => {
					canvas.toBlob((blob: Blob | null) => {
						if (blob) {
							const file = new File([blob], "cofiblocks-purchase.png", { type: "image/png" });
							console.log("Image file created:", file.name, "Size:", file.size, "bytes");
							setIsGeneratingImage(false);
							resolve(file);
							return;
						}
						console.error("Failed to create blob from canvas");
						setIsGeneratingImage(false);
						resolve(null);
					}, "image/png", 0.95);
				});
			} catch (error) {
				// Make sure to restore element even if there's an error
				if (originalNextSibling && originalParent) {
					originalParent.insertBefore(element, originalNextSibling);
				} else if (originalParent) {
					originalParent.appendChild(element);
				}
				if (cleanContainer.parentNode) {
					document.body.removeChild(cleanContainer);
				}
				throw error;
			}
		} catch (error) {
			console.error("Error generating share image:", error);
			setIsGeneratingImage(false);
			return null;
		}
	};

	// Helper function to download image file
	const downloadImage = (file: File): void => {
		console.log("Downloading image:", file.name, "Size:", file.size, "bytes");
		
		if (!file || file.size === 0) {
			console.error("Invalid file provided for download");
			alert(t("order_success.download_error") || "Failed to download image. Please try again.");
			return;
		}

		try {
			const url = URL.createObjectURL(file);
			console.log("Created object URL:", url);
			
			// Create download link
			const a = document.createElement("a");
			a.href = url;
			a.download = file.name;
			a.style.display = "none";
			a.setAttribute("download", file.name);
			
			// Ensure the link is in the DOM before clicking (required by some browsers)
			document.body.appendChild(a);
			
			// Use requestAnimationFrame to ensure DOM is ready
			requestAnimationFrame(() => {
				try {
					console.log("Triggering download click...");
					// Trigger click event
					const clickEvent = new MouseEvent("click", {
						bubbles: true,
						cancelable: true,
						view: window,
					});
					a.dispatchEvent(clickEvent);
					
					// Give the browser more time to initiate download before cleanup
					setTimeout(() => {
						try {
							if (a.parentNode) {
								document.body.removeChild(a);
							}
							// Don't revoke URL immediately - give browser time to download
							setTimeout(() => {
								URL.revokeObjectURL(url);
								console.log("Download cleanup completed");
							}, 5000); // Wait 5 seconds before revoking
						} catch (cleanupError) {
							console.error("Error during cleanup:", cleanupError);
						}
					}, 2000); // Wait 2 seconds before removing element
				} catch (clickError) {
					console.error("Error triggering download:", clickError);
					// Fallback to direct click if dispatchEvent fails
					a.click();
					setTimeout(() => {
						try {
							if (a.parentNode) {
								document.body.removeChild(a);
							}
							setTimeout(() => URL.revokeObjectURL(url), 5000);
						} catch (e) {
							console.error("Cleanup error:", e);
						}
					}, 2000);
				}
			});
		} catch (error) {
			console.error("Error downloading image:", error);
			// Fallback: try using fetch and creating blob URL with better error handling
			try {
				const url = URL.createObjectURL(file);
				// Try opening in new tab as last resort
				const newWindow = window.open(url, "_blank");
				if (newWindow) {
					// Show message to user
					setTimeout(() => {
						alert(t("order_success.download_instruction") || "The image has been opened in a new tab. Please right-click and select 'Save image as...' to download it.");
						URL.revokeObjectURL(url);
					}, 1000);
				} else {
					// Popup blocked - show user a download link
					alert(t("order_success.download_popup_blocked") || "Please allow popups to download the image, or check your browser's download folder.");
				}
			} catch (fallbackError) {
				console.error("Fallback download also failed:", fallbackError);
				alert(t("order_success.download_error") || "Failed to download image. Please try again.");
			}
		}
	};

	const handleShare = async (platform: "x" | "instagram" | "native") => {
		const shareImage = await generateShareImage();

		// Check if image generation failed
		if (!shareImage) {
			console.error("Failed to generate share image");
			alert(t("order_success.image_generation_error") || "Failed to generate image. Please try again.");
			return;
		}

		// Check if Web Share API with files is supported (mobile browsers)
		const supportsFileShare = typeof navigator !== "undefined" 
			&& "share" in navigator 
			&& "canShare" in navigator 
			&& navigator.canShare({ files: [shareImage] });

		// For all platforms, prioritize native share with image if supported
		if (supportsFileShare) {
			try {
				await navigator.share({
					title: t("order_success.share_title") || "My coffee purchase on CofiBlocks!",
					text: shareText,
					url: shareUrl,
					files: [shareImage],
				});
				return; // Successfully shared via native API
			} catch (error) {
				// User cancelled - don't proceed with fallback
				if ((error as { name?: string }).name === "AbortError") {
					return;
				}
				// If native share failed for other reasons, fall through to platform-specific handling
				console.log("Native share failed, falling back to platform-specific sharing:", error);
			}
		}

		// Platform-specific fallbacks for desktop or when native share isn't available
		if (platform === "native") {
			// Try text-only native share as fallback
			if (typeof navigator !== "undefined" && "share" in navigator) {
				try {
					await navigator.share({
						title: t("order_success.share_title") || "My coffee purchase on CofiBlocks!",
						text: shareText,
						url: shareUrl,
					});
					return;
				} catch (error) {
					console.log("Text-only native share failed:", error);
				}
			}
			// If native share not available, download image
			downloadImage(shareImage);
			return;
		}

		if (platform === "x") {
			// For X (Twitter), download image and open Twitter
			// Note: Twitter web doesn't support direct image upload via URL
			// User will need to manually attach the downloaded image
			downloadImage(shareImage);
			
			// Open Twitter after a delay to allow download to start
			setTimeout(() => {
				const twitterText = shareText; // Already includes URL
				const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&hashtags=${hashtags}`;
				window.open(twitterUrl, "_blank", "width=600,height=400");
			}, 500);
			return;
		}

		if (platform === "instagram") {
			// Instagram doesn't have a web sharing API
			// Download the image - user can manually upload to Instagram
			downloadImage(shareImage);
		}
	};

	const handleGoToOrders = () => {
		router.push("/user/my-orders");
	};

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Main Content */}
			<div className="flex-1 flex flex-col items-center justify-start pt-8 p-4 bg-white">
			<div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
					{/* Shareable content (hidden, used for image generation) */}
					{/* Using inline styles with hex colors to avoid oklch compatibility issues with html2canvas */}
					<div
						ref={shareableContentRef}
						style={{
							position: "fixed",
							left: "-9999px",
							top: 0,
							width: "1080px",
							height: "1080px",
							backgroundColor: "#ffffff",
							padding: "3rem",
							fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
							color: "#111827",
							margin: 0,
							border: "none",
							boxSizing: "border-box",
							lineHeight: "1.5",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: "950px", margin: "0 auto", padding: "0 1rem" }}>
							{/* Success Image */}
							<div style={{ position: "relative", width: "200px", height: "240px", marginBottom: "1.5rem" }}>
								<img
									src="/images/success.png"
									alt="Coffee cup"
									width={200}
									height={240}
									style={{ objectFit: "contain" }}
								/>
							</div>

							{/* Title */}
							<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem", textAlign: "center", width: "100%" }}>
								<h1 style={{ fontSize: "2.75rem", fontWeight: "bold", color: "#111827", margin: 0, lineHeight: "1.2", wordWrap: "break-word", overflowWrap: "break-word" }}>
									{t("order_success.congrats") || "Congrats!"}
								</h1>
								<p style={{ fontSize: "1.625rem", fontWeight: "600", color: "#374151", margin: 0, lineHeight: "1.2", wordWrap: "break-word", overflowWrap: "break-word", maxWidth: "100%" }}>
									{t("order_success.coffee_on_way") || "Your coffee is on the way!"}
								</p>
							</div>

							{/* Message */}
							<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", textAlign: "center", width: "100%", marginBottom: "1.5rem" }}>
								<p style={{ fontSize: "1.25rem", color: "#4B5563", margin: 0, lineHeight: "1.6", maxWidth: "700px", marginLeft: "auto", marginRight: "auto" }}>
									{t("order_success.support_message") || "Your purchase is directly supporting small coffee producers in Costa Rica."}
								</p>
								<p style={{ fontSize: "1.25rem", fontWeight: "500", color: "#374151", margin: 0, lineHeight: "1.6" }}>
									{t("order_success.thank_you") || "Thank you for being a #CoffeeLover"}
								</p>
							</div>

							{/* Purchased Items */}
							{cartItems.length > 0 && (
								<div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
									<p style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1F2937", textAlign: "center", margin: 0, marginBottom: "0.75rem" }}>
										{t("order_success.your_purchase") || "Your purchase:"}
									</p>
									<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
										{cartItems.map((item) => (
											<div
												key={item.id}
												style={{
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													gap: "1.25rem",
													padding: "1.25rem",
													backgroundColor: "#F9FAFB",
													borderRadius: "0.75rem",
													border: "1px solid #E5E7EB",
													width: "100%",
													maxWidth: "600px",
												}}
											>
												<img
													src={getImageUrl(item.imageUrl)}
													alt={item.name}
													width={100}
													height={100}
													style={{ borderRadius: "0.75rem", objectFit: "cover", flexShrink: 0 }}
												/>
												<div style={{ flex: 1, textAlign: "left" }}>
													<p style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", margin: 0, marginBottom: "0.25rem" }}>{item.name}</p>
													<p style={{ fontSize: "1rem", color: "#4B5563", margin: 0 }}>
														{item.quantity} {item.quantity === 1 ? (t("bag") || "bag") : (t("bags") || "bags")} - {item.is_grounded ? (t("coffee_type.grounded") || t("grounded") || "Grounded") : (t("coffee_type.bean") || t("bean") || "Bean")}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Branding */}
							<div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "2px solid #E5E7EB", textAlign: "center", width: "100%" }}>
								<p style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#111827", margin: 0, marginBottom: "0.25rem" }}>CofiBlocks</p>
								<p style={{ fontSize: "0.875rem", color: "#6B7280", margin: 0 }}>cofiblocks.com</p>
							</div>
						</div>
					</div>

					{/* Visible content */}
					<div className="w-full flex flex-col items-center">
						{/* Success Image */}
						<div className="relative w-32 h-32 mb-8">
					<Image
								src="/images/success.png"
						alt="Coffee cup with floating coffee beans"
						width={128}
						height={128}
						priority
								className="object-contain"
					/>
				</div>

						{/* Title */}
						<div className="space-y-4 mt-6 mb-8">
							<h1 className="text-3xl font-bold text-gray-900">
								{t("order_success.congrats") || "Congrats!"}
							</h1>
							<p className="text-lg font-semibold text-gray-700">
								{t("order_success.coffee_on_way") || "Your coffee is on the way!"}
							</p>
						</div>

						{/* Message */}
						<div className="space-y-3">
							<p className="text-base text-gray-600">
								{t("order_success.support_message") || "Your purchase is directly supporting small coffee producers in Costa Rica."}
							</p>
							<p className="text-base font-medium text-gray-700">
								{t("order_success.thank_you") || "Thank you for being a #CoffeeLover"}
							</p>
						</div>

						{/* Purchased Items */}
						{cartItems.length > 0 && (
							<div className="w-full space-y-3 mt-6">
								<p className="text-sm font-medium text-gray-700 text-left">
									{t("order_success.your_purchase") || "Your purchase:"}
								</p>
				<div className="space-y-2">
									{cartItems.map((item) => (
										<div
											key={item.id}
											className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
										>
											<Image
												src={getImageUrl(item.imageUrl)}
												alt={item.name}
												width={60}
												height={60}
												className="rounded-lg object-cover"
											/>
											<div className="flex-1 text-left">
												<p className="font-medium text-gray-900">{item.name}</p>
												<p className="text-sm text-gray-600">
													{item.quantity} {item.quantity === 1 ? (t("bag") || "bag") : (t("bags") || "bags")} - {item.is_grounded ? (t("coffee_type.grounded") || t("grounded") || "Grounded") : (t("coffee_type.bean") || t("bean") || "Bean")}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Social Sharing */}
						<div className="w-full space-y-3 mt-6">
							<p className="text-sm font-medium text-gray-700">
								{t("order_success.share_label") || "Share your purchase:"}
							</p>
							
							{/* Mobile: Show 3 buttons */}
							{isMobile ? (
								<div className="flex items-center justify-center gap-3">
									{/* X (Twitter) */}
									<button
										type="button"
										onClick={() => handleShare("x")}
										disabled={isGeneratingImage}
										className="p-3 bg-black hover:bg-gray-800 text-white rounded-full transition-colors disabled:opacity-50"
										aria-label="Share on X"
									>
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<title>X</title>
											<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
										</svg>
									</button>

									{/* Instagram */}
									<button
										type="button"
										onClick={() => handleShare("instagram")}
										disabled={isGeneratingImage}
										className="p-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white rounded-full transition-colors disabled:opacity-50"
										aria-label="Share on Instagram"
									>
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<title>Instagram</title>
											<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
										</svg>
									</button>

									{/* Native Share (Share Anywhere) */}
									{(typeof navigator !== "undefined" && "share" in navigator) && (
										<button
											type="button"
											onClick={() => handleShare("native")}
											disabled={isGeneratingImage}
											className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors disabled:opacity-50"
											aria-label="Share"
										>
											<ArrowTopRightOnSquareIcon className="w-6 h-6" />
										</button>
									)}
								</div>
							) : (
								/* Desktop: Show single Share button that downloads the image */
								<div className="flex flex-col items-center justify-center gap-3">
									<button
										type="button"
										onClick={async () => {
											// On desktop, just download the image so user can manually share
											const shareImage = await generateShareImage();
											if (shareImage) {
												downloadImage(shareImage);
											}
										}}
										disabled={isGeneratingImage}
										className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
										aria-label="Download share image"
									>
										<ArrowTopRightOnSquareIcon className="w-5 h-5" />
										<span>{t("order_success.share_button") || "Share"}</span>
									</button>
									<p className="text-xs text-gray-600 text-center max-w-md">
										{t("order_success.desktop_share_instruction") || "An image will be downloaded. You can share it on your favorite social media platform."}
									</p>
								</div>
							)}
							
							{isGeneratingImage && (
								<p className="text-xs text-gray-500 text-center">
									{t("order_success.generating_image") || "Generating image..."}
								</p>
							)}
						</div>

						{/* Track Order Button */}
						<div className="w-full pt-6 mt-6">
							<Button
								onClick={handleGoToOrders}
								className="w-full bg-yellow-400 hover:bg-yellow-500 text-black h-14"
							>
								{t("order_success.track_in_my_orders") || "Track in my orders"}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
