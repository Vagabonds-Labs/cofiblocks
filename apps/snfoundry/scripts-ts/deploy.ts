import { addAddressPadding } from "starknet";
import {
	deployContract,
	deployer,
	executeDeployCalls,
	exportDeployments,
} from "./deploy-contract";
import { green } from "./helpers/colorize-log";

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
const deployScript = async (): Promise<void> => {
	console.log("🚀 Deploying with address:", green(deployer.address));

	// await deployContract({
	// 	contract: "cofi_collection.cairo",
	// 	contractName: "CofiCollection",
	// 	constructorArgs: {
	// 		default_admin: deployer.address,
	// 		pauser: deployer.address,
	// 		minter: deployer.address,
	// 		uri_setter: deployer.address,
	// 		upgrader: deployer.address,
	// 	},
	// });
	// Deploy Marketplace
	await deployContract({
		contract: "marketplace.cairo",
		contractName: "Marketplace",
		// TODO: incluide constructor args for deploy
		// cofi_collection_address: ContractAddress
		// cofi_vault_address: ContractAddress
		// strk_contract: ContractAddress
		constructorArgs: {
			cofi_collection_address: addAddressPadding(
				"0x0448d8cc3403303a76d89a56b7e8ecf9aa9fcd41e7bb66d10f4be5b67b2f8aab",
			),
			admin: deployer.address,
			market_fee: BigInt(300000),
		},
	});
};

deployScript()
	.then(async () => {
		await executeDeployCalls();
		exportDeployments();

		console.log(green("All Setup Done"));
	})
	.catch(console.error);
