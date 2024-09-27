interface TypographyProps {
	children: React.ReactNode;
	className?: string;
}

export const H1 = ({ children, className = "" }: TypographyProps) => (
	<h1 className={`font-manrope font-bold text-4xl leading-[48px] ${className}`}>
		{children}
	</h1>
);

export const H2 = ({ children, className = "" }: TypographyProps) => (
	<h2 className={`font-manrope font-bold text-[32px] leading-10 ${className}`}>
		{children}
	</h2>
);

export const H3 = ({ children, className = "" }: TypographyProps) => (
	<h3 className={`font-manrope font-bold text-[28px] leading-9 ${className}`}>
		{children}
	</h3>
);

export const H4 = ({ children, className = "" }: TypographyProps) => (
	<h4 className={`font-manrope font-bold text-2xl leading-[34px] ${className}`}>
		{children}
	</h4>
);

export const Text = ({
	children,
	className = "",
	isSemiBold = false,
}: TypographyProps & { isSemiBold?: boolean }) => (
	<p
		className={`font-inter ${isSemiBold ? "font-semibold" : "font-normal"} text-base leading-normal ${className}`}
	>
		{children}
	</p>
);

export const TextSecondary = ({
	children,
	className = "",
}: TypographyProps) => (
	<p className={`font-inter font-normal text-sm leading-tight ${className}`}>
		{children}
	</p>
);

export const TextLegend = ({ children, className = "" }: TypographyProps) => (
	<p className={`font-inter font-normal text-xs leading-none ${className}`}>
		{children}
	</p>
);
