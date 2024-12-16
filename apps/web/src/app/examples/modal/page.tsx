"use client";

import Button from "@repo/ui/button";
import Modal from "@repo/ui/modal";
import React from "react";
import useModal from "~/app/_components/hooks/useModal";

function ModalExample() {
	const { isOpen, openModal, closeModal } = useModal();

	const handleConfirm = () => {
		console.log("Confirmed");
		closeModal();
	};

	return (
		<div className="h-screen flex flex-col items-center justify-center space-y-4">
			<h1 className="text-2xl font-bold mb-4">Modal Example</h1>
			<Button onClick={openModal} variant="primary" size="lg">
				Open Modal
			</Button>

			<Modal
				isOpen={isOpen}
				onClose={closeModal}
				title="Example Modal"
				buttons={[
					{ label: "Confirm", onClick: handleConfirm, variant: "primary" },
					{ label: "Cancel", onClick: closeModal, variant: "secondary" },
				]}
			>
				<p className="text-gray-700">
					This is an example modal content. You can put any React components or
					HTML elements here.
				</p>
				<div className="mt-4">
					<input
						type="text"
						placeholder="Enter some text"
						className="w-full p-2 border border-gray-300 rounded-md"
					/>
				</div>
			</Modal>
		</div>
	);
}

export default ModalExample;
