"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAccount } from "@starknet-react/core";
import Link from "next/link";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";
import { ProfileOptions } from "./ProfileOptions";

type ProfileOptionLayoutProps = {
	title: string;
	children: React.ReactNode;
	backLink?: string;
};

function ProfileOptionLayout({
	title,
	children,
	backLink,
}: ProfileOptionLayoutProps) {
	const { address } = useAccount();

	return (
		<Main>
			<Header
				profileOptions={
					address ? <ProfileOptions address={address} /> : undefined
				}
			/>
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center mb-6">
					<Link href={backLink ?? "/marketplace"} className="mr-4">
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
