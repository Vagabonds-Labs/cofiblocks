import type { OrderStatus } from "@prisma/client";
import Button from "@repo/ui/button";
import RadioButton from "@repo/ui/form/radioButton";
import React, { type FormEvent } from "react";
import type { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import BottomModal from "~/app/_components/ui/BottomModal";

type StatusUpdateModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e?: FormEvent<HTMLFormElement>) => Promise<void>;
	control: Control<{ status: OrderStatus }>;
	statusStepsKeys: string[];
};

export default function StatusUpdateModal({
	isOpen,
	onClose,
	onSubmit,
	control,
	statusStepsKeys,
}: StatusUpdateModalProps) {
	const { t } = useTranslation();

	return (
		<BottomModal isOpen={isOpen} onClose={onClose}>
			<form onSubmit={onSubmit} className="space-y-4">
				<h3 className="text-xl font-semibold my-4 text-content-title">
					{t("update_status")}
				</h3>
				<div className="flex flex-col gap-2">
					{statusStepsKeys.map((status) => (
						<React.Fragment key={status}>
							<RadioButton
								name="status"
								value={status}
								label={t(`order_status.${status.toLowerCase()}`)}
								control={control}
							/>
							<hr className="my-2 border-surface-primary-soft" />
						</React.Fragment>
					))}
				</div>
				<Button type="submit" className="w-full !mt-6">
					{t("apply")}
				</Button>
			</form>
		</BottomModal>
	);
}
