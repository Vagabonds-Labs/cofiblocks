"use client";

import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import { useAccount, useDisconnect } from "@starknet-react/core";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Header from "~/app/_components/layout/Header";
import Main from "~/app/_components/layout/Main";

export default function UnauthorizedPage() {
	const { t } = useTranslation();
	const { address, disconnect } = useAccount();

	return (
		<Main>
			<Header address={address} disconnect={disconnect} />
			<div className="min-h-screen flex items-center justify-center px-4">
				<div className="max-w-md w-full text-center">
					<div className="mb-8">
						<ShieldExclamationIcon className="mx-auto h-24 w-24 text-amber-500 mb-4" />
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							{t("access_denied")}
						</h1>
						<p className="text-lg text-gray-600 mb-6">
							{t("insufficient_permissions")}
						</p>
						<p className="text-sm text-gray-500 mb-8">
							{t("contact_admin_for_access")}
						</p>
					</div>

					<div className="space-y-4">
						<Link href="/marketplace">
							<Button className="w-full">{t("go_to_marketplace")}</Button>
						</Link>

						<Link href="/user/register-coffee">
							<Button variant="outline" className="w-full">
								{t("become_coffee_producer")}
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</Main>
	);
}
