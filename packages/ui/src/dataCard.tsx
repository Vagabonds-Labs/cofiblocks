import { Text } from "./typography";

export interface DataCardProps {
	title: string;
	value: string;
}

export function DataCard({ title, value }: DataCardProps) {
	return (
		<div className="p-4 bg-surface-primary-soft rounded-lg">
			<Text className="text-sm text-gray-500 mb-1">{title}</Text>
			<Text className="text-lg font-semibold">{value}</Text>
		</div>
	);
}
