"use client";

import Alert from "@repo/ui/alert";
import Button from "@repo/ui/button";
import useAlerts from "~/app/_components/hooks/useAlert";

function AlertsExample() {
	const { alerts, addAlert, removeAlert } = useAlerts();

	const showAlert = (type: "success" | "error" | "info") => {
		const alertConfig = {
			success: { message: "Success!", description: "This is a success alert." },
			error: { message: "Error!", description: "This is an error alert." },
			info: { message: "Info!", description: "This is an info alert." },
		};
		addAlert({ type, ...alertConfig[type] });
	};

	return (
		<div className="h-screen flex flex-col items-center justify-start space-y-4 mt-10">
			<h1 className="text-2xl font-bold mb-4">Alerts Example</h1>
			<Button variant="primary" size="md" onClick={() => showAlert("success")}>
				Show Success Alert
			</Button>

			<Button variant="secondary" size="md" onClick={() => showAlert("error")}>
				Show Error Alert
			</Button>

			<Button variant="primary" size="md" onClick={() => showAlert("info")}>
				Show Info Alert
			</Button>

			<div className="fixed top-4 left-0 right-0 space-y-4 px-4">
				{alerts.map((alert) => (
					<Alert
						key={alert.id}
						message={alert.message}
						description={alert.description}
						type={alert.type}
						onDismiss={() => removeAlert(alert.id)}
					/>
				))}
			</div>
		</div>
	);
}

export default AlertsExample;
