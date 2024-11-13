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

	await deployContract({
		contract: "cofi_collection.cairo",
		contractName: "CofiCollection",
		constructorArgs: {
			default_admin: deployer.address,
			pauser: deployer.address,
			minter: deployer.address,
			uri_setter: deployer.address,
			upgrader: deployer.address,
		},
	});
	// Deploy Marketplace
	await deployContract({
		contract: "Marketplace.cairo",
		contractName: "Marketplace",
		// TODO: incluide constructor args for deploy
		// cofi_collection_address: ContractAddress
		// cofi_vault_address: ContractAddress
		// strk_contract: ContractAddress
		constructorArgs: {
			cofi_collection_address: deployer.address,
			cofi_vault_address: deployer.address,
			strk_contract: deployer.address,
			admin: deployer.address,
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
