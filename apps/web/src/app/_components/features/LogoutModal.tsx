import Button from "@repo/ui/button";
import { useRouter } from "next/navigation";
import BottomModal from "~/app/_components/ui/BottomModal";
import { useTranslation } from "~/i18n";

interface LogoutModalProps {
	isOpen: boolean;
	onClose: () => void;
}

function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
	const { t } = useTranslation();
	const router = useRouter();

	const handleLogout = () => {
		// TODO: Implement logout/disconnect logic
		alert(t("logout_logic"));
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

export { LogoutModal };
