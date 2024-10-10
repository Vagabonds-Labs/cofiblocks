// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^0.15.0

#[starknet::contract]
mod Marketplace {
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use openzeppelin::upgrade::UpgradeableComponent;
    use openzeppelin::upgrade::interface::IUpgradeable;
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    // Role definition
    const PRODUCER: felt252 = selector!("PRODUCER");
    const CONSUMER: felt252 = selector!("CONSUMER");

    // Access Control
    #[abi(embed_v0)]
    impl AccessControlImpl = AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    
    // Upgradeable
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>

    #[derive(Drop)]
    struct Product {
        stock: u256,
        price: u256,
    }

    #[storage]
    struct Storage {
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        listed_products: Map<u256, Product>,
        seller_products: Map<ContractAddress, u256>,
        cofi_collection_address: ContractAddress,
        cofi_vault_address: ContractAddress,

    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        UpgradeableEevent: UpgradeableComponent::Event,
        DeleteProduct: DeleteProduct,
        CreateProduct: CreateProduct,
        UpdateStock: UpdateStock,
        BuyProduct: BuyProduct,
        PaymentSeller: PaymentSeller,


    }
    // Emitted when a product is unlisted from the Marketplace
    #[derive(Drop, PartialEq, starknet::Event)]
    struct DeleteProduct {
        #[key]
        token_id: u256,
    }

    // Emitted when a product is listed to the Marketplace
    #[derive(Drop, PartialEq, starknet::Event)]
    struct CreateProduct {
        #[key]
        token_id: u256,
        initial_stock: u256,
    }

    // Emitted when the stock of a product is updated
    #[derive(Drop, PartialEq, starknet::Event)]
    struct UpdateStock {
        #[key]
        token_id: u256,
        new_stock: u256,
    }

    // Emitted when a product is bought from the Marketplace
    #[derive(Drop, PartialEq, starknet::Event)]
    struct BuyProduct {
        #[key]
        token_id: u256,
        amount: u256,
        price: u256,
    }

    // Emitted when the seller gets their tokens from a sell
    #[derive(Drop, PartialEq, starknet::Event)]
    struct PaymentSeller {
        #[key]
        token_id: u256,
        #[key]
        seller: ContractAddress,
        payment: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, cofi_collection_address: ContractAddress, cofi_vault_address: ContractAddress, admin: ContractAddress) {
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, admin);
        self.cofi_collection_address.write(cofi_collection_address);
        self.cofi_vault_address.write(cofi_vault_address);
    }

    fn assign_seller_role(ref self: ContractState) {
        self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
        self.accesscontrol._grant_role(PRODUCER, get_caller_address());
    }

    fn assign_consumer_role(ref self: ContractState) {
        self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
        self.accesscontrol._grant_role(CONSUMER, get_caller_address());
    }

    fn buy_product(ref self: ContractState) {
        self.accesscontrol.assert_only_role(CONSUMER);
        
    }

    fn create_product(ref self: ContractState) {
        self.accesscontrol.assert_only_role(PRODUCER)
    }

    fn update_stock(ref self: ContractState) {
        self.accesscontrol.assert_only_role(PRODUCER);
    }

    fn delete_product(ref self: ContractState) {
        self.accesscontrol.assert_only_role(PRODUCER);
    } 






}