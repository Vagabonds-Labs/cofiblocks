# CofiBlocks Contracts

## Deployment Guide

Follow these steps to deploy the CofiBlocks contracts on the StarkNet network.

### 1. Configure the `.env` file

Set the following environment variables in your `.env` file with the details of a prefunded wallet. This wallet will act as the admin address:

- **`PRIVATE_KEY_SEPOLIA`** – The private key of the admin wallet.
- **`ACCOUNT_ADDRESS_SEPOLIA`** – The address of the admin wallet.
- **`TOKEN_METADATA_URL`** – The IPFS URL to serve as the token metadata.
  
  The URL should follow the format: `ipfs://<CID>/{id}.json`, where `{id}` will be dynamically replaced with the actual token ID by clients when fetching metadata.
  
  **Example:**
  ```
  ipfs://bafybeihevtihdmcjkdh6sjdtkbdjnngbfdlr3tjk2dfmvd3demdm57o3va/{id}.json
  ```
  For token ID `1`, the resulting URL will be:
  ```
  ipfs://bafybeihevtihdmcjkdh6sjdtkbdjnngbfdlr3tjk2dfmvd3demdm57o3va/1.json
  ```

### 2. Install dependencies

Run the following command to install project dependencies:
```bash
bun i
```

### 3. Deploy the contracts

To deploy the contracts on the Sepolia testnet, run:
```bash
bun deploy:sepolia
```

This command will:
- Deploy both the **CofiCollections** and **Marketplace** contracts.
- Set the **Marketplace** contract as the minter in the **CofiCollection** contract.
- Set the `base_uri` in the **CofiCollection** contract using the `TOKEN_METADATA_URL` value from the `.env` file.

### 4. Retrieve deployed contract addresses

Once the deployment is complete, the contract addresses will be available in:
- The terminal output.
- The file located at: `deployments/sepolia_latest.json`.


## Testing
To test the contracts, follow these steps.

1. Go to contracts folder
```bash
cd contracts
```

2. Run test command
```bash
scarb test
```

## Note
When updating the contracts, you need to update them in the web app too. To do that follow this steps

1. Go to page https://scaffold-stark-demo.vercel.app/configure
2. Copy/paste the contract address in the Address field. Use this valid names: CofiCollection, Marketplace.
3. Click on download Contract file. It will give you a json file with the contract abi and contract address.
4. Update the file https://github.com/Vagabonds-Labs/cofiblocks/blob/main/apps/web/src/contracts/configExternalContracts.ts
with the new data (just copy/paste the contract metadata in the corresponding field without affecting other contracts metadata).
5. Do the same for Marketplace contract.
