# Test File: `test_cofi_collection.cairo`

This file contains **unit tests** for the `CofiCollection` smart contract, written in **Cairo** for the StarkNet ecosystem. It ensures that core functionalities of the `CofiCollection` contract behave as expected, covering minting, burning, transferring tokens, and managing contract state.

---

## Scripts and Commands

To run the tests in `test_cofi_collection.cairo`, ensure you have **Scarb** (StarkNet's package manager) installed.

### **Building the Contracts**
First, compile the contracts to generate the required artifacts:

```bash
scarb build
```

### **Running the Tests**
Execute the tests in the project using:

```bash
scarb test
```

This command runs all tests within the `src/test` directory, including `test_cofi_collection.cairo`.

### **Modules and Components Interaction**

The `test_cofi_collection.cairo` file interacts with the following modules and components:

  **1. CofiCollection Contract**
  - Implements token minting, burning, transfer functionalities, and approvals.
  
  **2. Receiver Contract**
  - Acts as a mock receiver to test token transfers.

  **3. Helpers and Utilities**
  - `start_cheat_caller_address`: Changes the caller address to simulate different accounts.
  - `declare`: Declares and deploys contracts.
  ```arduino
  Test File
   ├── Deploy CofiCollection Contract
   │   ├── Mint Tokens
   │   ├── Transfer Tokens
   │   ├── Burn Tokens
   │   ├── Batch Operations (mint, burn, transfer)
   │   └── Manage Contract State (pause, unpause, set URI)
   └── Receiver Contract
       └── Tests for receiving tokens and verifying balances
  ```

### **Development Guidelines**

- Coding Conventions:
  - Use descriptive test names (e.g., `test_safe_mint`, `test_balance_of`).
  - Structure tests following the Arrange-Act-Assert pattern.
- Cheat Code Utilities:
  - Use `start_cheat_caller_address` to simulate calls from specific accounts.
- Organize Test Cases:
  - Group related tests together (e.g., minting, burning, transfers).
  - Include edge cases (e.g., non-existent tokens, paused contract).

### **Test Cases Included**

1. Minting Tokens:
   
   - `test_safe_mint`: Verifies single token minting.
   - `test_batch_mint`: Ensures batch minting of multiple tokens.
  
2. Token Balances

   - `test_balance_of`: Checks the balance of specific token IDs.
   - `test_balance_of_batch`: Tests batch balance queries.

3. Token Transfers

   - `test_safe_transfer_from`: Ensures safe transfer of tokens between accounts.
   - `test_safe_batch_transfer_from`: Validates batch token transfers.

4. Burning Tokens

   - `test_burn`: Verifies single token burns.
   - `test_batch_burn`: Checks batch burning of multiple tokens.
  
5. Approvals

   - `test_set_approval_for_all`: Tests setting and revoking operator approvals.

6. Contract State Management

   - `test_pause`: Ensures contract operations halt when paused and resume when unpaused.
  
7. URI Management

   - `test_uri`: Validates setting and retrieving token URIs.

8. Custom Minting

   - `test_mint_item`: Tests minting a token with a specific URI.

### **Example Test Case Breakdown**

Here’s an example of the `test_safe_mint` function with an explanation:

```rust
#[test]
fn test_safe_mint() {
    let cofi_collection = deploy_cofi_collection();
    let receiver = deploy_receiver();

    // OWNER does the transactions to cofi_collection
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    let token_id = 1_u256;
    let value = 1_u256;
    let data: Array<felt252> = array![0];
    let span = data.span();

    cofi_collection.mint(receiver, token_id, value, span);
    let balance = cofi_collection.balance_of(receiver, token_id);
    assert(balance == value, 'Incorrect balance');
}
```

### Explanation
1. Setup:

   - Deploy the `CofiCollection` and `Receiver` contracts.
   - Set the caller to `OWNER()` using `start_cheat_caller_address`.

2. Execution:

   - Mint a token (`token_id = 1`) with a value of `1`.

3. Assertion:

   - Verify the receiver's balance matches the minted value.

### How to Write Additional Tests

To add new test cases:

1. Deploy the Contract: Use the `deploy_cofi_collection()` helper function to set up the contract.

2. Simulate Caller Accounts: Use `start_cheat_caller_address` to simulate calls from different addresses.

3. Write Test Logic:

   - Perform contract actions (e.g., mint, transfer, burn).
   - Use `assert` statements to verify expected outcomes.

```rust
#[test]
fn test_new_feature() {
    let cofi_collection = deploy_cofi_collection();
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    // Example action
    cofi_collection.some_function();

    // Example assertion
    assert(some_condition, "Test failed!");
}
```



