import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import cx from "classnames";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Button from "./button";

type AlertProps = {
	message: string;
	description: string;
	type: "success" | "error" | "info";
	onDismiss: () => void;
};

const alertColors = {
	success: "bg-success-default text-white",
	error: "bg-error-default text-surface-inverse",
	info: "bg-surface-primary-soft text-surface-primary-default",
};

const alertIcons = {
	success: CheckCircleIcon,
	error: XMarkIcon,
	info: CheckCircleIcon,
};

function Alert({ message, description, type, onDismiss }: AlertProps) {
	const { t } = useTranslation();

	const alertVariants = {
		hidden: { y: "-100%", opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: "spring", stiffness: 100 },
		},
		exit: {
			y: "-100%",
			opacity: 0,
			transition: { type: "spring", stiffness: 100 },
		},
	};

	const Icon = alertIcons[type];

	return (
		<motion.div
			className={cx(
				"flex items-center justify-between p-4 rounded-lg shadow-lg mb-4",
				alertColors[type],
			)}
			variants={alertVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			drag="y"
			dragConstraints={{ top: 0, bottom: 0 }}
			onDragEnd={(e, { offset, velocity }) => {
				if (offset.y < -100 || velocity.y < -300) {
					onDismiss();
				}
			}}
		>
			<div className="flex items-center">
				<Icon className="w-10 h-10 mr-3" />
				<div>
					<h4 className="font-bold">{t(message)}</h4>
					<p>{t(description)}</p>
				</div>
			</div>
			<Button variant="primary" size="sm" onClick={onDismiss}>
				{t("dismiss_button")}
			</Button>
		</motion.div>
	);
}

export default Alert;
