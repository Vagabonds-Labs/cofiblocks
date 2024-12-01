import Button from "@repo/ui/button";
import { useTranslation } from "react-i18next";
import BottomModal from "~/app/_components/ui/BottomModal";

interface FarmModalProps {
	isOpen: boolean;
	onClose: () => void;
	farmData: {
		name: string;
		since: string;
		bio: string;
		experiences: string;
		goodPractices: string;
	};
	isEditable?: boolean;
	onEdit: () => void;
}

function FarmModal({
	isOpen,
	onClose,
	farmData,
	isEditable,
	onEdit,
}: FarmModalProps) {
	const { t } = useTranslation("common");

	return (
		<BottomModal isOpen={isOpen} onClose={onClose}>
			<div className="flex flex-col items-center w-full">
				<div className="w-full max-w-[24.375rem]">
					<div className="flex flex-col gap-6">
						<div>
							<h3 className="text-2xl font-bold text-content-title">
								{farmData.name}
							</h3>
							<p className="text-sm text-content-body-default">
								{t("producing_since", { since: farmData.since })}
							</p>
						</div>

						<div>
							<h4 className="text-base font-semibold mb-2">{t("bio_title")}</h4>
							<p className="text-base text-content-title">{farmData.bio}</p>
						</div>

						<div>
							<h4 className="text-base font-semibold mb-2">
								{t("experiences_title")}
							</h4>
							<p className="text-base text-content-title">
								{farmData.experiences}
							</p>
						</div>

						<div>
							<h4 className="text-base font-semibold mb-2">
								{t("good_practices_title")}
							</h4>
							<p className="text-base text-content-title">
								{farmData.goodPractices}
							</p>
						</div>

						{isEditable && (
							<Button onClick={onEdit} className="w-full">
								{t("edit_button")}
							</Button>
						)}
					</div>
				</div>
			</div>
		</BottomModal>
	);
}

export { FarmModal };
