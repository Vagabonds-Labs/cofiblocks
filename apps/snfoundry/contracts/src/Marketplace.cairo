// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^0.15.0
use starknet::ContractAddress;

#[starknet::interface]
pub trait IMarketplace<ContractState> {
    fn assign_seller_role(ref self: ContractState, assignee: ContractAddress);
    fn assign_consumer_role(ref self: ContractState, assignee: ContractAddress);
    fn assign_admin_role(ref self: ContractState, assignee: ContractAddress);
    fn buy_product(ref self: ContractState, token_id: u256, token_amount: u256);
    fn buy_products(ref self: ContractState, token_ids: Span<u256>, token_amount: Span<u256>);
    fn create_product(ref self: ContractState, token_id: u256, initial_stock: u256, price: u256);
    fn create_products(ref self: ContractState, token_ids: Span<u256>, initial_stock: Span<u256>, price: Span<u256>);
    fn delete_product(ref self: ContractState, token_id: u256);
    fn delete_products(ref self: ContractState, token_ids: Span<u256>);
    fn claim(ref self: ContractState);
}

#[starknet::contract]
mod Marketplace {
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::token::erc1155::ERC1155ReceiverComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use contracts::cofi_collection::{ICofiCollectionDispatcher, ICofiCollectionDispatcherTrait};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Map, Vec, VecTrait, MutableVecTrait
    };
    use starknet::{ContractAddress, get_caller_address, get_contract_address};

    component!(path: ERC1155ReceiverComponent, storage: erc1155_receiver, event: ERC1155ReceiverEvent);
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
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

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
        // TODO: test mapping
        seller_products: Map<ContractAddress, Vec<u256>>,
        cofi_collection_dispatcher: ICofiCollectionDispatcher,
        cofi_vault_address: ContractAddress,
        // TODO: make STRK contract address a constant to avoid storing it in the contract
        strk_token_dispatcher: IERC20Dispatcher,
        claim_balances: Map<ContractAddress, u256>,
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
        UpgradeableEvent: UpgradeableComponent::Event,
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
        fn assign_seller_role(ref self: ContractState, assignee: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(PRODUCER, assignee);
        }
    
        fn assign_consumer_role(ref self: ContractState, assignee: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(CONSUMER, assignee);
        }

        fn assign_admin_role(ref self: ContractState, assignee: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, assignee);
        } 
    
        fn buy_product(ref self: ContractState, token_id: u256, token_amount: u256) {
            let stock = self.listed_products.entry(token_id).read().stock;
            assert(stock >= token_amount, 'Not enough stock');
            let buyer = get_caller_address();
            let contract_address = get_contract_address();
            // TODO: change transfer to use calculate_fee function and add it to the claim balances accordingly
            let token = self.strk_token_dispatcher.read();
            let price = self.listed_products.entry(token_id).read().price;
            token.transfer_from(buyer, contract_address, price);
            let cofi_collection = self.cofi_collection_dispatcher.read();
            cofi_collection.safe_transfer_from(contract_address, buyer, token_id, token_amount, array![0].span());
            let new_stock = stock - token_amount;
            update_stock(ref self, token_id, new_stock);
            self.emit(BuyProduct { token_id, amount: token_amount, price });
            if (!self.accesscontrol.has_role(CONSUMER, get_caller_address())) {
                self.accesscontrol._grant_role(CONSUMER, get_caller_address());
            }
            // TODO: implement payment to producer (sending the fee) -> the fee should be stored in a variable in the smart contract

        }

        fn buy_products(ref self: ContractState, token_ids: Span<u256>, token_amount: Span<u256>) {
            assert!(token_ids.len() == token_amount.len(), "Token ids and amounts must all have the same length");
            // TODO: Loop through token_ids to check if there is enough stock in all of them
            let buyer = get_caller_address();
            let contract_address = get_contract_address();
            // TODO: change transfer to use calculate_fee function and add it to the claim balances accordingly
            let token = self.strk_token_dispatcher.read();
            // TODO: transfer the amount fromm the sum of the price of all the token_ids 
            // TODO: update the stock for each token_id
            if (!self.accesscontrol.has_role(CONSUMER, buyer)) {
                self.accesscontrol._grant_role(CONSUMER, buyer);
            }
        }
    
        fn create_product(ref self: ContractState, token_id: u256, initial_stock: u256, price: u256) {
            self.accesscontrol.assert_only_role(PRODUCER);
            let cofi_collection = self.cofi_collection_dispatcher.read();
            cofi_collection.mint(get_contract_address(), token_id, initial_stock, array![0].span());
            let product = Product { stock: initial_stock, price };
            self.seller_products.entry(get_caller_address()).append().write(token_id);
            self.listed_products.entry(token_id).write(product);
            self.emit(CreateProduct { token_id, initial_stock });
        }

        fn create_products(ref self: ContractState, token_ids: Span<u256>, initial_stock: Span<u256>, price: Span<u256>) {
            let len_token_ids = token_ids.len();
            assert!(
                len_token_ids == initial_stock.len() && len_token_ids == price.len(),
                "Token ids, initial stock, and price must all have the same length"
            );
            self.accesscontrol.assert_only_role(PRODUCER);
            let producer = get_caller_address();
            let cofi_collection = self.cofi_collection_dispatcher.read();
            cofi_collection.batch_mint(get_contract_address(), token_ids, initial_stock, array![0].span());
            // TODO: loop through the spans and call initalize_product
            
        }
    
        fn delete_product(ref self: ContractState, token_id: u256) {
            self.accesscontrol.assert_only_role(PRODUCER);
            let producer = get_caller_address();
            assert(self.seller_products.entry(producer).read() == token_id, 'Not your product');
            let new_stock = 0;
            let cofi_collection = self.cofi_collection_dispatcher.read();
            let token_holder = get_contract_address();
            let amount_tokens = cofi_collection.balance_of(token_holder, token_id);
            update_stock(ref self, token_id, new_stock);
            cofi_collection.burn(token_holder, token_id, amount_tokens);
            self.emit(DeleteProduct { token_id });
        }

        fn delete_products(ref self: ContractState, token_ids: Span<u256>) {
            self.accesscontrol.assert_only_role(PRODUCER);
            let producer = get_caller_address();
            // TODO: assert all the token_ids are from the producer (loop)
            // TODO: Update all the token_ids properly calling update stock (loop) can be done in same loop
            // TODO: cofi_colletion.batch_burn()
        }

        fn claim(ref self: ContractState) {
            self.accesscontrol.assert_only_role(PRODUCER);
            let producer = get_caller_address();
            let claim_balance = self.claim_balances.entry(producer).read();
            assert(claim_balance > 0, 'No tokens to claim');
            let token = self.strk_token_dispatcher.read();
            token.approve(producer, claim_balance);
            let transfer = token.transfer_from(get_contract_address(), producer, claim_balance);
            assert(transfer, 'Error claiming');
        }
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

    fn initialize_product(ref self: ContractState, token_id: u256, producer: ContractAddress, stock: u256, price: u256) {
        let product = Product { stock, price };
        self.seller_products.entry(producer).append().write(token_id);
        self.listed_products.entry(token_id).write(product);
        self.emit(CreateProduct { token_id, initial_stock: stock });
    }

    fn update_stock(ref self: ContractState, token_id: u256, new_stock: u256) {
        self.listed_products.entry(token_id).write().stock = new_stock;
        self.emit(UpdateStock { token_id, new_stock });
    }    

    // Amount is the total amount 
    // BPS is the percentage you want to calculate. (Example: 2.5% = 250bps, 7,48% = 748bps)
    // Use example: 
    // Calculate the 3% fee of 250 STRK
    // calculate_fee(250, 300) = 7.5
    fn calculate_fee(amount: u256, bps: u256) -> u256 {
        assert((amount * bps) >= 10_000, 'Fee too low');
        amount * bps / 10_000
    }






}