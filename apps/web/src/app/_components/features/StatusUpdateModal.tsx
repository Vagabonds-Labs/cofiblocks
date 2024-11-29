import Button from "@repo/ui/button";
import RadioButton from "@repo/ui/form/radioButton";
import React, { BaseSyntheticEvent, type FormEvent } from "react";
import { type Control, useForm } from "react-hook-form";
import BottomModal from "~/app/_components/ui/BottomModal";
import type { StatusStepsEnum } from "./ProductStatusDetails";

type StatusUpdateModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e?: FormEvent<HTMLFormElement>) => Promise<void>;
	control: Control<{ status: StatusStepsEnum }>;
	statusStepsKeys: string[];
};

export function StatusUpdateModal({
	isOpen,
	onClose,
	onSubmit,
	control,
	statusStepsKeys,
}: StatusUpdateModalProps) {
	return (
		<BottomModal isOpen={isOpen} onClose={onClose}>
			<h3 className="text-xl font-semibold mb-4 text-content-title">
				Select the status
			</h3>
			<form onSubmit={onSubmit} className="space-y-4">
				{" "}
				{}
				<div className="flex flex-col gap-2">
					{statusStepsKeys.map((status, index) => (
						<React.Fragment key={status}>
							<label className="flex items-center gap-2">
								<RadioButton
									name="status"
									label={status}
									value={status}
									control={control}
								/>
							</label>
							{index < statusStepsKeys.length - 1 && (
								<hr className="my-2 border-surface-primary-soft" />
							)}
						</React.Fragment>
					))}
				</div>
				<Button type="submit" className="w-full !mt-6">
					Apply
				</Button>
			</form>
		</BottomModal>
	);
}
