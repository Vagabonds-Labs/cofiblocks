declare module "blockies-react-svg" {
	interface BlockiesSvgProps {
		address: string;
		size: number;
		scale: number;
	}

	const BlockiesSvg: React.FC<BlockiesSvgProps>;
	export default BlockiesSvg;
}
