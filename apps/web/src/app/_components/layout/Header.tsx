"use client";

import { CubeTransparentIcon } from "@heroicons/react/24/outline";
import PageHeader from "@repo/ui/pageHeader";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface HeaderProps {
	address: string | undefined;
	disconnect: () => void;
}

function Header({ address, disconnect }: HeaderProps) {
	const router = useRouter();

	const handleLogout = async () => {
		await signOut();
		disconnect();
		router.push("/");
	};

	const leftIcon = (
		<CubeTransparentIcon className="h-6 w-6 text-content-title" />
	);

	return (
		<PageHeader
			title="CofiBlocks"
			leftIcon={leftIcon}
			userAddress={address}
			onLogout={handleLogout}
		/>
	);
}

export default Header;
