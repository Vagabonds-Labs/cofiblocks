"use client";

import Button from "@repo/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import BottomModal from "../ui/BottomModal";

interface LogoutModalProps {
	isOpen: boolean;
	onClose: () => void;
}

function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
	const { t } = useTranslation();
	const router = useRouter();

	const handleLogout = async () => {
		await signOut();
		onClose();
		router.push("/");
	};

	return (
		<BottomModal isOpen={isOpen} onClose={onClose}>
			<h3 className="text-xl font-semibold mb-4 text-content-title text-center">
				{t("disconnect_confirmation")}
			</h3>
			<div className="flex flex-col gap-2">
				<Button className="w-full" onClick={handleLogout}>
					{t("yes_disconnect")}
				</Button>
				<Button className="w-full" variant="secondary" onClick={onClose}>
					{t("cancel")}
				</Button>
			</div>
		</BottomModal>
	);
}

export default LogoutModal;
