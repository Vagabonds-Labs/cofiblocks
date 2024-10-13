import Button from "@repo/ui/button";
import { useRouter } from "next/navigation";
import BottomModal from "~/app/_components/ui/BottomModal";

interface LogoutModalProps {
	isOpen: boolean;
	onClose: () => void;
}

function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
	const router = useRouter();

	const handleLogout = () => {
		// TODO: Implement logout/disconnect logic
		alert("Implement logout logic");
		onClose();
		router.push("/");
	};

	return (
		<BottomModal isOpen={isOpen} onClose={onClose}>
			<h3 className="text-xl font-semibold mb-4 text-content-title text-center">
				Do you want to disconnect?
			</h3>
			<div className="flex flex-col gap-2">
				<Button className="w-full" onClick={handleLogout}>
					{" "}
					Yes, disconnect
				</Button>
				<Button className="w-full" variant="secondary" onClick={onClose}>
					{" "}
					Cancel
				</Button>
			</div>
		</BottomModal>
	);
}

export { LogoutModal };
