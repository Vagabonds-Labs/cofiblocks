import { addAddressPadding, byteArray } from "starknet";
import {
	deployContract,
	deployer,
	executeDeployCalls,
	exportDeployments,
} from "./deploy-contract";
import { green, yellow } from "./helpers/colorize-log";

/**
 * Deploy a contract using the specified parameters.
 *
 * @example (deploy contract with contructorArgs)
 * const deployScript = async (): Promise<void> => {
 *   await deployContract(
 *     {
 *       contract: "YourContract",
 *       contractName: "YourContractExportName",
 *       constructorArgs: {
 *         owner: deployer.address,
 *       },
 *       options: {
 *         maxFee: BigInt(1000000000000)
 *       }
 *     }
 *   );
 * };
 *
 * @example (deploy contract without contructorArgs)
 * const deployScript = async (): Promise<void> => {
 *   await deployContract(
 *     {
 *       contract: "YourContract",
 *       contractName: "YourContractExportName",
 *       options: {
 *         maxFee: BigInt(1000000000000)
 *       }
 *     }
 *   );
 * };
 *
 *
 * @returns {Promise<void>}
 */

const string_to_byte_array = (str: string): string[] => {
	const byte_array = byteArray.byteArrayFromString(str);
	const result = [`0x${byte_array.data.length.toString(16)}`];
	for (let i = 0; i < byte_array.data.length; i++) {
		result.push(byte_array.data[i].toString());
	}
	if (byte_array.pending_word) {
		result.push(byte_array.pending_word.toString());
	}
	result.push(`0x${byte_array.pending_word_len.toString(16)}`);
	return result;
};

const deployScript = async (): Promise<void> => {
	console.log("🚀 Creating deployment calls...");
	const admin_address = deployer.address;

	const { address: cofiCollectionAddress } = await deployContract({
		contract: "CofiCollection",
		constructorArgs: {
			default_admin: admin_address,
			pauser: admin_address,
			minter: admin_address,
			uri_setter: admin_address,
			upgrader: admin_address,
		},
	});

	const { address: distributionAddress } = await deployContract({
		contract: "Distribution",
		constructorArgs: {
			admin: admin_address,
		},
	});

	const { address: marketplaceAddress } = await deployContract({
		contract: "Marketplace",
		constructorArgs: {
			cofi_collection_address: cofiCollectionAddress,
			distribution_address: distributionAddress,
			admin: admin_address,
			market_fee: BigInt(5000), // 50 %
		},
	});

	console.log(
		"CofiCollection will be deployed at:",
		green(cofiCollectionAddress),
	);
	console.log("Distribution will be deployed at:", green(distributionAddress));
	console.log("Marketplace will be deployed at:", green(marketplaceAddress));
	await executeDeployCalls();

	console.log("🚀 Performing initial configs...");
	const base_uri_txt = process.env.TOKEN_METADATA_URL || "";
	console.log("Base URI:", base_uri_txt);
	const transactions = [
		{
			contractAddress: cofiCollectionAddress,
			entrypoint: "set_minter",
			calldata: {
				minter: marketplaceAddress,
			},
		},
		{
			contractAddress: cofiCollectionAddress,
			entrypoint: "set_base_uri",
			calldata: string_to_byte_array(base_uri_txt),
		},
		{
			contractAddress: distributionAddress,
			entrypoint: "set_marketplace",
			calldata: {
				marketplace: marketplaceAddress,
			},
		},
	];
	const { transaction_hash } = await deployer.execute(transactions);
	console.log("🚀 Final transactions hash", transaction_hash);
	console.log(
		yellow(
			"Make sure to update the contracts metadata in web app!! See README.md",
		),
	);
};

deployScript()
	.then(async () => {
		exportDeployments();

		console.log(green("All Setup Done"));
	})
	.catch(console.error);
