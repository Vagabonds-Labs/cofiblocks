import { Text } from "@repo/ui/typography";
import { useTranslation } from "react-i18next";

interface ProducerInfoProps {
	farmName: string;
	region: string;
}

export function ProducerInfo({ farmName, region }: ProducerInfoProps) {
	const { t } = useTranslation();

	return (
		<div className="border-t pt-6">
			<Text className="text-lg font-semibold mb-4">{t("farm_details")}</Text>
			<div className="space-y-4">
				<div>
					<Text className="text-sm text-gray-500">{t("farm_name")}</Text>
					<Text className="text-base font-medium">{farmName}</Text>
				</div>
				<div>
					<Text className="text-sm text-gray-500">{t("region")}</Text>
					<Text className="text-base font-medium">{region}</Text>
				</div>
			</div>
		</div>
	);
}
