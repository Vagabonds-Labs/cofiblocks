"use client";

import Button from "@repo/ui/button";
import Modal from "@repo/ui/modal";
import useModal from "~/app/_components/hooks/useModal";

function ModalExample() {
	const { isOpen, openModal, closeModal } = useModal();

	return (
		<div className="h-screen flex flex-col items-center justify-center space-y-4">
			<h1 className="text-2xl font-bold mb-4">Modal Example</h1>
			<Button onClick={openModal} variant="primary" size="lg">
				Open Modal
			</Button>

			<Modal
				isOpen={isOpen}
				onClose={closeModal}
				buttons={[
					{ label: "Confirm", onClick: () => console.log("Confirmed") },
					{ label: "Cancel", onClick: closeModal },
				]}
			/>
		</div>
	);
}

export default ModalExample;
