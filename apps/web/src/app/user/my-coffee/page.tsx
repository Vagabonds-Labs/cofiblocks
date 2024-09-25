import { ProfileOptionLayout } from "~/app/_components/features/ProfileOptionLayout";

export default function MyCoffee() {
	return (
		<ProfileOptionLayout title="My coffee">
			<div className="bg-white rounded-lg p-6">
				<p>My coffee content goes here.</p>
			</div>
		</ProfileOptionLayout>
	);
}
