# `snfoundry` Directory

The `snfoundry` directory within the CofiBlocks project contains key components, scripts, and configurations required for managing smart contracts, deployment processes, and supporting tools for the StarkNet ecosystem.

This document provides a high-level overview of each folder and file in the directory to help developers quickly understand the structure and purpose of the contents.

---

## Folder and File Breakdown

### 1. `contracts/`

**Purpose**:
This folder contains the smart contracts implemented in Cairo for StarkNet. These contracts define the core business logic and interactions for the application.

**Key Highlights**:
- Contracts are written in Cairo, StarkNet's programming language.
- Example: Marketplace smart contract was integrated as part of recent updates.

---

### 2. `deployments/`

**Purpose**:
This folder stores the deployment artifacts for the smart contracts.

**Key Highlights**:
- Deployment files may include JSON outputs that map contract names to their deployed addresses and ABIs.
- These artifacts ensure contract deployment information is organized and easily accessible.

---

### 3. `scripts-cairo/`

**Purpose**:
Contains scripts written in Cairo, used for testing, interaction, or automation tasks related to smart contracts.

**Key Highlights**:
- Scripts written in Cairo help automate tasks like contract interaction and testing.
- Used primarily for on-chain execution and testing smart contract functionality.

---

### 4. `scripts-ts/`

**Purpose**:
This folder contains TypeScript scripts that automate various tasks, such as deploying, interacting with, and verifying smart contracts.

**Files Overview**:
- `deploy-contracts.ts`: Core logic for declaring and deploying contracts.
- `deploy.ts`: Entry script to deploy specific contracts like CofiCollection and Marketplace.
- `verify-contracts.ts`: Verifies deployed contracts on networks such as Sepolia or Mainnet.
- `helpers/`: Utility scripts, including scripts like:
    - `colorize-log.ts`: Adds colored terminal outputs.
    - `fees.ts`: Manages fee token selection and balances.
    - `networks.ts`: Configures StarkNet network providers and deployer accounts. 
- `types.ts`: TypeScript type definitions for network configurations and deployment parameters.

`Key Features`:
- Supports automation using CLI arguments.
- Manages deployments for different networks (Devnet, Sepolia, Mainnet).
- Verifies contract deployment and integrity.

---

## Files in the Root Directory
`.env.example`

**Purpose:**
This file provides a template for environment variables used in the project. Developers should copy this file to create a .env file and configure variables like private keys and RPC URLs.

**Example Variables :**

```env
PRIVATE_KEY_DEVNET=your_devnet_private_key
RPC_URL_DEVNET=http://127.0.0.1:5050
```

---

`.gitignore`

**Purpose**:
Specifies files and directories to be ignored by Git. This typically includes:
- Environment files (`.env`)
- Node modules
- Build artifacts

---

`package.json`

**Purpose**:
Defines the project’s dependencies, scripts, and metadata for Node.js.

**Key Highlights:**
- Includes dependencies like `yargs`, `starknet`, and `typescript`.
- Provides scripts for running deployments and utilities.

---

`tsconfig.json`

**Purpose**:
Configuration file for TypeScript, specifying compiler options and paths.

**Key Highlights**:
- Ensures compatibility with modern TypeScript standards.
- Targets Node.js runtime.

---

There are also markdown files in folder that clearly defines the structure and function of each file in the particular folders, some of them include:
- `mock-contracts.md`
- `test.md`
- `helper.md`
- `scripts-ts.md`

These are the ones available at the time of creation of this file