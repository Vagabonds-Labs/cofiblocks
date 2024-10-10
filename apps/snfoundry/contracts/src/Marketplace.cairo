// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^0.15.0

#[starknet::interface]
pub trait IMarketplace<ContractState> {
    fn assign_seller_role(ref self: ContractState);
    fn assign_consumer_role(ref self: ContractState);
    fn buy_product(ref self: ContractState);
    fn create_product(ref self: ContractState);
    fn update_stock(ref self: ContractState);
    fn delete_product(ref self: ContractState);
}

#[starknet::contract]
mod Marketplace {
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::token:erc1155::ERC1155ReceiverComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::upgrade::UpgradeableComponent;
    use openzeppelin::upgrade::interface::IUpgradeable;
    use contracts::cofi_collection::{ICofiCollectionDispatcher, ICofiCollectionDispatcherTrait};
    use starknet::ContractAddress;
    use starknet::{get_caller_address, get_contract_address};

    coomponent!(path: ERC1155ReceiverComponent, storage: erc1155_receiver, event: ERC1155ReceiverEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    // Role definition
    const PRODUCER: felt252 = selector!("PRODUCER");
    const CONSUMER: felt252 = selector!("CONSUMER");

    // ERC1155Receiver
    #[abi(embed_v0)]
    impl ERC1155ReceiverImpl = ERC1155ReceiverComponent::ERC1155ReceiverImpl<ContractState>;
    impl ERC1155ReceiverInternalImpl = ERC1155ReceiverComponent::InternalImpl<ContractState>;

    // SRC5
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    // Access Control
    #[abi(embed_v0)]
    impl AccessControlImpl = AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    
    // Upgradeable
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>

    // Include Hash derive since it is being used as a mapping in Storage
    #[derive(Drop, Hash)]
    struct Product {
        stock: u256,
        price: u256,
    }

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc1155_receiver: ERC1155ReceiverComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        listed_products: Map<u256, Product>,
        // TODO: modify seller products to be a list of products (array of u256, which are token_ids)
        seller_products: Map<ContractAddress, u256>,
        cofi_collection_dispatcher: ICofiCollectionDispatcher,
        cofi_vault_address: ContractAddress,
        strk_token_dispatcher: IERC20Dispatcher,

    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC1155ReceiverEvent: ERC1155ReceiverComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
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
    fn constructor(ref self: ContractState, cofi_collection_address: ContractAddress, cofi_vault_address: ContractAddress, strk_contract: ContractAddress, admin: ContractAddress) {
        self.erc1155_receiver.initializer();
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, admin);
        self.cofi_collection_dispatcher.write(ICofiCollectionDispatcher { contract_address: cofi_collection_address });
        self.cofi_vault_address.write(cofi_vault_address);
        // TODO: figure out a way to receive multiple tokens besides STRK
        self.strk_token_dispatcher.write(IERC20Dispatcher { contract_address: strk_contract });
    }

    #[abi(embed_v0)]
    impl MarketplaceImpl of super::IMarketplace<ContractState> {
        fn assign_seller_role(ref self: ContractState) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(PRODUCER, get_caller_address());
        }
    
        fn assign_consumer_role(ref self: ContractState) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(CONSUMER, get_caller_address());
        }
    
        fn buy_product(ref self: ContractState, token_id: u256, token_amount: u256) {
            self.accesscontrol.assert_only_role(CONSUMER);
            let stock = self.listed_products.entry(token_id).read().stock;
            assert(stock >= token_amount, 'Not enough stock');
            let buyer = get_caller_address();
            let contract_address = get_contract_address();
            // TODO: modify transfer to handle fees properly (ideal to use internal function)
            let token = self.strk_token_dispatcher.read();
            let price = self.listed_products.entry(token_id).read().price;
            token.transfer_from(buyer, contract_address, price);
            let cofi_collection = self.cofi_collection_dispatcher.read();
            cofi_collection.safe_transfer_from(contract_address, buyer, token_id, token_amount, array![0].span());
            let new_stock = stock - token_amount;
            self.update_stock(token_id, new_stock);
            self.emit(BuyProduct { token_id, amount: token_amount, price });
            // TODO: implement payment to producer (sending the fee)

        }

        // TODO: create a function to buy multiple products
    
        fn create_product(ref self: ContractState, token_id: u256, initial_stock: u256, price: u256) {
            self.accesscontrol.assert_only_role(PRODUCER)
            let cofi_collection = self.cofi_collection_dispatcher.read();
            cofi_colletion.mint(get_contract_address(), token_id, initial_stock, array![0].span());
            let product = Product { stock: initial_stock, price };
            self.seller_products.entry(get_caller_address()).write(token_id);
            self.listed_products.entry(token_id).write(product);
            self.emit(CreateProduct { token_id, initial_stock });
            // TODO: is this necessary or leave only create_product?
            self.emit(UpdateStock { token_id, new_stock: initial_stock });
        }

        // TODO: create a function to create multiple products (batch_mint)
    
        fn delete_product(ref self: ContractState, token_id: u256) {
            self.accesscontrol.assert_only_role(PRODUCER);
            let producer = get_caller_address();
            assert(self.seller_products.entry(producer).read() == token_id, 'Not your product');
            let new_stock = 0;
            let cofi_collection = self.cofi_collection_dispatcher.read();
            let token_holder = get_contract_address();
            let amount_tokens = cofi_collection.balance_of(token_holder, token_id);
            update_stock(token_id, new_stock);
            cofi_collection.burn(token_holder, token_id, amount_tokens);
            self.emit(DeleteProduct { token_id });
        }

        // TODO: create a function to delete multiple products (batch_burn)
    
    }

    // Function to only receive tokens from the CofiCollection contract
    #[abi(per_item)]
    #[generate_trait]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn on_erc1155_received(
            self: @ContractState,
            operator: ContractAddress,
            from: ContractAddress,
            token_id: u256,
            value: u256,
            data: Span<felt252>
        ) -> felt252 {
            assert(from == self.cofi_collection_dispatcher.read().contract_address, 'ERC1155: wrong contract');
            self.erc1155_receiver.on_erc1155_received(operator, from, token_id, value, data)
        }
    }

    fn update_stock(ref self: ContractState, token_id: u256, new_stock: u256) {
        self.listed_products.entry(token_id).write().stock = new_stock;
        self.emit(UpdateStock { token_id, new_stock });
    }    






}