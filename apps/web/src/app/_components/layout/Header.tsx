"use client";

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

	return (
		<PageHeader
			title="CofiBlocks"
			userAddress={address}
			onLogout={handleLogout}
		/>
	);
}

export default Header;
