# Receiver Contract - Mock Contracts

This directory contains **mock contracts** written in **Cairo**, StarkNet's native language. Mock contracts are used to simulate real-world contracts for testing and development purposes.

The `Receiver` contract, located in this folder, is a **mock implementation** that integrates two OpenZeppelin Cairo components:
- **`ERC1155ReceiverComponent`**: For receiving ERC1155 tokens.
- **`SRC5Component`**: For implementing StarkNet's introspection capabilities.

---

## Purpose

The `Receiver` contract serves as a testing utility to:
- Simulate receiving ERC1155 tokens.
- Implement **OpenZeppelin's Cairo-compatible standards** (ERC1155 and SRC5).
- Test interactions between smart contracts in a controlled environment.

This is particularly useful for **validating ERC1155 token transfers** and **event handling** during the development of StarkNet-based applications.

---

## Key Components

### **License and Compatibility**

The contract uses the **MIT License** and is compatible with OpenZeppelin Cairo Contracts version **^0.15.0**.

```rust
// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^0.15.0
```

### StarkNet Contract Module

- The contract is defined as a StarkNet contract using `#[starknet::contract]`.

```rust
#[starknet::contract]
mod Receiver {
```

### Imports

- The contract imports components from OpenZeppelin Cairo for:

    1. Introspection (`SRC5Component`) - Implements introspection functionality.
    2. ERC1155 Receiver (`ERC1155ReceiverComponent`) - Handles ERC1155 token reception.
   
   ```rust
   use openzeppelin::introspection::src5::SRC5Component;
   use openzeppelin::token::erc1155::ERC1155ReceiverComponent;
   ```
### Components

- The component! macro integrates the imported components into the contract.

    1. ERC1155ReceiverComponent - Adds functionality to receive ERC1155 tokens.
    2. SRC5Component - Provides StarkNet-compatible introspection.
   
   ```rust
   component!(
    path: ERC1155ReceiverComponent, storage: erc1155_receiver, event: ERC1155ReceiverEvent
    );
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    ```

### Implementations

 The contract implements the following interfaces:
  1. ERC1155Receiver Implementation
    - Allows the contract to receive ERC1155 tokens. It includes:
    - ERC1155ReceiverImpl for external calls.
    - InternalImpl for internal logic.
  
  ```rust
    #[abi(embed_v0)]
    impl ERC1155ReceiverImpl =
        ERC1155ReceiverComponent::ERC1155ReceiverImpl<ContractState>;
    impl ERC1155ReceiverInternalImpl = ERC1155ReceiverComponent::InternalImpl<ContractState>;
  ```

  1. SRC5 Implementation
    Provides introspection capabilities for StarkNet contracts.

    ```rust
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    ```

### Storage

The `Storage` struct contains sub-storage for the integrated components.
Each component's storage is defined under the contract's state.

```rust
#[storage]
struct Storage {
    #[substorage(v0)]
    erc1155_receiver: ERC1155ReceiverComponent::Storage,
    #[substorage(v0)]
    src5: SRC5Component::Storage
}
```

### Events

- The contract combines events from both components using an event enumeration.

    - `ERC1155ReceiverEvent` for ERC1155 token reception.
    - `SRC5Event` for introspection-related events.
  ```rust
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC1155ReceiverEvent: ERC1155ReceiverComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event
    }
    ```

### Constructor

- The contract has a constructor that initializes the `ERC1155ReceiverComponent` storage. This ensures the receiver can start handling incoming ERC1155 tokens.

```rust
#[constructor]
fn constructor(ref self: ContractState) {
    self.erc1155_receiver.initializer();
}
```

### How to Use the Contract

  1. Deploy the Contract
    Use a StarkNet-compatible development environment (e.g., Scarb or Katana) to deploy the `Receiver` contract.

  2. Simulate Token Transfers
    Send ERC1155 tokens to this contract to validate the behavior of `ERC1155ReceiverComponent`.

  3. Test Introspection
    Use the `SRC5Component` methods to test contract introspection capabilities.

### Summary of Features

- ERC1155ReceiverComponent: Implements ERC1155 token reception for StarkNet.
- SRC5Component: Provides introspection functionalities.
- Custom Events: Emits events for ERC1155 and SRC5 actions.
- Modular Storage: Integrates storage for both components under a single contract state.






