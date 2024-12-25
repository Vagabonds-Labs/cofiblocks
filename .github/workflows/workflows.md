# GitHub Workflows for CofiBlocks

The `.github/workflows` directory contains YAML files that define automated processes using GitHub Actions. These workflows are essential for tasks such as continuous integration (CI), testing, and deployment within the CofiBlocks project.

## Workflow Files

## 1. **`deploy.yml` - Database Migration Pipeline**

### **Name**  
- The name of this workflow is **"Database Migration Pipeline"**, which appears in the GitHub Actions UI.

    ```yaml
    name: Database Migration Pipeline
    ```

### **Trigger Events (`on`)**
- **Push**: The workflow runs when code is pushed to the main branch, but only if the changes affect files inside the prisma directory.   
- **Pull Request**: The workflow runs when a pull request targets the main branch.
    ```yaml
    on:
  push:
    branches:
      - main
    paths:
      - 'prisma/**'  
  pull_request:
    branches:
      - main
    ```

### **Job Definition (`migrate`)**
- This job is called migrate and executes on an Ubuntu environment.

    ```yaml
    jobs:
    migrate:
    runs-on: ubuntu-latest
    ```

### **Environment Variable**
- `DATABASE_URL` is pulled from GitHub Secrets and provides the connection string to the database.
    ```yaml
    env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```
### **Steps**
- **Step 1** - Check Out Repository
    Retrieves the repository’s code so the workflow can operate on it.
    ```yaml
    steps:
      - name: Check out the repository
        uses: actions/checkout@v3
    ```
- **Step 2** - Set Up Node.js
    Installs Node.js version `18`, which is required for running the Prisma CLI.
    ```yaml
    - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
    ```
- **Step 3** - Install Prisma CLI
    Installs Prisma globally to execute database migration commands.
    ```yaml
    - name: Install dependencies
        run: npm install -g prisma
    ```
- **Step 4** - Run Prisma Migrations
    Deploys the database schema migrations using Prisma’s migrate deploy command.
    ```yaml
    - name: Run Prisma migrations
        run: prisma migrate deploy

## 2. **`test.yml` - Continuous Integration (CI)**

The `test.yml` file performs tasks like testing smart contracts and checking code formatting. It runs on pull requests, pushes to the `main` branch, and on a daily schedule.

### **Name**

- The name of this workflow is "CI" (Continuous Integration), which appears in the GitHub Actions UI:

    ```yaml
    name: CI

### **Trigger Events (`on`)**
- **Pull Request**: Executes whenever a pull request is opened or updated.
- **Push**: Executes when changes are pushed to the `main` branch.
- **Schedule**: Executes daily at midnight, defined using a cron expression.
  
    ```yaml
        on:
    pull_request:
    push:
        branches:
        - main
    schedule:
        - cron: "0 0 * * *"  # Run daily at midnight
    ```

### **Permissions**
Grants the workflow read-only access to all repository resources.

    ```yaml
    permissions: read-all
    ```

### **Job: `test-contracts`**
This job runs smart contract tests in an Ubuntu environment.

- **Step 1** - Check Out Repository
    Retrieves the repository code.
    ```yaml
    jobs:
        test-contracts:
            runs-on: ubuntu-latest
            steps:
            - uses: actions/checkout@v4
    

- **Step 2** - Set Up Foundry
    Configures Foundry, a toolchain for smart contract testing.
    ```yaml
     - uses: foundry-rs/setup-snfoundry@v3
     ```
- **Step 3** - Set Up Scarb
    Configures Scarb, a package manager for StarkNet’s Cairo language.
    ```yaml
    - uses: software-mansion/setup-scarb@v1
        with:
          tool-versions: ./apps/snfoundry/contracts/.tool-versions
    ```
- **Step 4** - Run Tests
    Executes the smart contract tests using `snforge test`.
    ```yaml
    - name: Run tests
        run: cd apps/snfoundry/contracts && snforge test
    ```

## **Job: `lint`**
This job checks the formatting of the codebase to ensure it meets the project’s standards.

- **Step 1** - Check Out Repository
    Retrieves the repository code.
    ```yaml
    lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
    ```
- **Step 2** - Set Up Foundry
    Configures Foundry for smart contract development.
    ```yaml
     - uses: foundry-rs/setup-snfoundry@v3
     ```
- **Step 3** - Set Up Scarb
    Configures Scarb to manage project dependencies.
    ```yaml
    - uses: software-mansion/setup-scarb@v1
        with:
          tool-versions: ./apps/snfoundry/contracts/.tool-versions
    ```
- **Step 4** - Check Formatting
    Runs `scarb fmt --check` to verify the code formatting.
    ```yaml
    - name: Check formatting
        run: cd apps/snfoundry/contracts && scarb fmt --check
    ```





