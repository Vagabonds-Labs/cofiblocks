import { createAvatar } from "@dicebear/core";
import { adventurerNeutral } from "@dicebear/collection";
import { useState, useEffect } from "react";

interface AvatarProps {
	userAddress?: string;
	showAvatar?: boolean;
	fallbackIcon?: string;
}

const Avatar: React.FC<AvatarProps> = ({
	userAddress,
	showAvatar = true,
	fallbackIcon = "/images/user-profile/fallback.svg", // Default fallback icon path
}) => {
	const [avatarSvg, setAvatarSvg] = useState<string | undefined>(undefined); // Change null to undefined

	const colorMapping: Record<string, string> = {
		"0": "b6e3f4",
		"1": "c0aede",
		"2": "6fe890",
		"3": "ffcbcb",
		"4": "d95525",
		"5": "d5f7f7",
		"6": "b0c7cc",
		"7": "e3d3d3",
		"8": "c3b7f2",
		"9": "ffb3ba",
		a: "ffb300",
		b: "f564f3",
		c: "9c27b0",
		d: "80b3f2",
		e: "00c8f8",
		f: "1db2db",
	};

	useEffect(() => {
		if (userAddress && showAvatar) {
			// Only generate the avatar if a user address exists
			const lastChar = userAddress[userAddress.length - 1]?.toLowerCase(); // Optional chaining
			const backgroundColor = lastChar ? colorMapping[lastChar] : "6d6d6e"; // Ensure there's a valid lastChar

			const avatar = createAvatar(adventurerNeutral, {
				seed: userAddress,
				flip: true,
				radius: 30,
				backgroundColor: [backgroundColor || "6d6d6e"], // Always ensure valid backgroundColor
			});

			const svgString = avatar.toString(); // Get the SVG string
			setAvatarSvg(svgString); // Save the SVG string to state
		} else {
			setAvatarSvg(undefined); // Clear the avatar if no user address or showAvatar is false
		}
	}, [userAddress, showAvatar]);

	// If avatarSvg exists, render it directly as an SVG image.
	const svgImage = avatarSvg
		? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(avatarSvg)}`
		: undefined; // Handle undefined

	return (
		<div className="rounded-full overflow-hidden relative w-12 h-12">
			{svgImage ? (
				<img
					src={svgImage} // Render the SVG as an image source
					alt={userAddress ? "User Avatar" : "Default avatar"}
					className="w-full h-full"
				/>
			) : (
				<img
					src={fallbackIcon}
					alt={userAddress ? "User Avatar" : "Default avatar"}
					className="w-full h-full"
				/>
			)}
		</div>
	);
};

export default Avatar;
