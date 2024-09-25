"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import Link from "next/link";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";

type ProfileOptionLayoutProps = {
	title: string;
	children: React.ReactNode;
};

function ProfileOptionLayout({ title, children }: ProfileOptionLayoutProps) {
	const { address } = useAccount();
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();

	return (
		<Main>
			<Header
				address={address}
				connect={connect}
				connectors={connectors}
				disconnect={disconnect}
			/>
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center mb-6">
					<Link href="/user-profile" className="mr-4">
						<ArrowLeftIcon
							name="arrow-left"
							className="w-5 h-5 text-gray-600"
						/>
					</Link>
					<h1 className="text-2xl font-semibold">{title}</h1>
				</div>
				{children}
			</div>
		</Main>
	);
}

export { ProfileOptionLayout };
