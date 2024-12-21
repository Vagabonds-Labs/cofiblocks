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
    fn create_product(
        ref self: ContractState, initial_stock: u256, price: u256, data: Span<felt252>
    );
    fn create_products(ref self: ContractState, initial_stock: Span<u256>, price: Span<u256>);
    fn delete_product(ref self: ContractState, token_id: u256);
    fn delete_products(ref self: ContractState, token_ids: Span<u256>);
    fn claim(ref self: ContractState);
}

#[starknet::contract]
mod Marketplace {
    use contracts::cofi_collection::{ICofiCollectionDispatcher, ICofiCollectionDispatcherTrait};
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc1155::erc1155_receiver::ERC1155ReceiverComponent;
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::upgrades::UpgradeableComponent;
    use starknet::event::EventEmitter;
    use starknet::storage::Map;
    use starknet::{
        ContractAddress, get_caller_address, get_contract_address, contract_address_const
    };

    component!(
        path: ERC1155ReceiverComponent, storage: erc1155_receiver, event: ERC1155ReceiverEvent
    );
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    // Role definition
    const PRODUCER: felt252 = selector!("PRODUCER");
    const CONSUMER: felt252 = selector!("CONSUMER");

    // ERC1155Receiver
    #[abi(embed_v0)]
    impl ERC1155ReceiverImpl =
        ERC1155ReceiverComponent::ERC1155ReceiverImpl<ContractState>;
    impl ERC1155ReceiverInternalImpl = ERC1155ReceiverComponent::InternalImpl<ContractState>;

    // SRC5
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    // Access Control
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    // Upgradeable
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    const STRK_TOKEN_ADDRESS: felt252 =
        0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;

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
        market_fee: u256,
        listed_product_stock: Map<u256, u256>,
        listed_product_price: Map<u256, u256>,
        seller_products: Map<u256, ContractAddress>,
        cofi_collection_address: ContractAddress,
        claim_balances: Map<ContractAddress, u256>,
        current_token_id: u256,
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
        BuyBatchProducts: BuyBatchProducts,
        PaymentSeller: PaymentSeller,
    }
    // Emitted when a product is unlisted from the Marketplace
    #[derive(Drop, PartialEq, starknet::Event)]
    struct DeleteProduct {
        token_id: u256,
    }

    // Emitted when a product is listed to the Marketplace
    #[derive(Drop, PartialEq, starknet::Event)]
    struct CreateProduct {
        token_id: u256,
        initial_stock: u256,
    }

    // Emitted when the stock of a product is updated
    #[derive(Drop, PartialEq, starknet::Event)]
    struct UpdateStock {
        token_id: u256,
        new_stock: u256,
    }

    // Emitted when a product is bought from the Marketplace
    #[derive(Drop, PartialEq, starknet::Event)]
    struct BuyProduct {
        token_id: u256,
        amount: u256,
        price: u256,
    }

    // Emitted when a batch of products is bought from the Marketplace
    #[derive(Drop, PartialEq, starknet::Event)]
    struct BuyBatchProducts {
        token_ids: Span<u256>,
        token_amount: Span<u256>,
        total_price: u256,
    }

    // Emitted when the seller gets their tokens from a sell
    #[derive(Drop, PartialEq, starknet::Event)]
    struct PaymentSeller {
        token_ids: Span<u256>,
        seller: ContractAddress,
        payment: u256,
    }

    ///
    /// Constructor.
    /// # Arguments
    /// * `cofi_collection_address` - The address of the CofiCollection contract
    /// * `admin` - The address of the admin role
    /// * `market_fee` - The fee that the marketplace will take from the sales
    /// * `base_uri` - The base uri for the NFTs metadata. Should contain `{id}` so that metadata
    /// gets
    ///    replace per each token id. Example: https://example.com/metadata/{id}.json
    ///
    #[constructor]
    fn constructor(
        ref self: ContractState,
        cofi_collection_address: ContractAddress,
        admin: ContractAddress,
        market_fee: u256,
    ) {
        self.erc1155_receiver.initializer();
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, admin);
        self.cofi_collection_address.write(cofi_collection_address);
        self.market_fee.write(market_fee);
        self.current_token_id.write(1);
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
            let stock = self.listed_product_stock.read(token_id);
            assert(stock >= token_amount, 'Not enough stock');

            let buyer = get_caller_address();
            let contract_address = get_contract_address();
            let strk_token_dispatcher = IERC20Dispatcher {
                contract_address: contract_address_const::<STRK_TOKEN_ADDRESS>()
            };
            // Get payment from buyer
            let mut producer_fee = self.listed_product_price.read(token_id) * token_amount;
            let mut total_price = producer_fee
                + self.calculate_fee(producer_fee, self.market_fee.read());
            assert(
                strk_token_dispatcher.balance_of(get_caller_address()) >= total_price,
                'insufficient funds'
            );
            strk_token_dispatcher.transfer_from(buyer, contract_address, total_price);

            // Transfer the nft products
            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read()
            };
            cofi_collection
                .safe_transfer_from(
                    contract_address, buyer, token_id, token_amount, array![0].span()
                );

            // Update stock
            let new_stock = stock - token_amount;
            self.update_stock(token_id, new_stock);

            self.emit(BuyProduct { token_id, amount: token_amount, price: total_price });
            if (!self.accesscontrol.has_role(CONSUMER, get_caller_address())) {
                self.accesscontrol._grant_role(CONSUMER, get_caller_address());
            }

            // Send payment to the producer
            let seller_address = self.seller_products.read(token_id);
            self
                .claim_balances
                .write(seller_address, self.claim_balances.read(seller_address) + producer_fee);
            let token_ids = array![token_id].span();
            self.emit(PaymentSeller { token_ids, seller: seller_address, payment: producer_fee });
        }

        fn buy_products(ref self: ContractState, token_ids: Span<u256>, token_amount: Span<u256>) {
            assert(token_ids.len() > 0, 'No products to buy');
            assert(token_ids.len() == token_amount.len(), 'wrong length of arrays');
            let buyer = get_caller_address();
            let contract_address = get_contract_address();

            // Check if the buyer has enough funds to buy all the products
            let mut token_idx = 0;
            let mut producer_fee = 0_u256;
            let mut producers_found = array![];
            loop {
                if token_idx == token_ids.len() {
                    break;
                }
                let stock = self.listed_product_stock.read(*token_ids.at(token_idx));
                assert(stock > 0, 'Product not available');
                let token_amount = *token_amount.at(token_idx);
                assert(stock >= token_amount, 'Not enough stock');
                producer_fee += self.listed_product_price.read(*token_ids.at(token_idx))
                    * token_amount;

                let producer = self.seller_products.read(*token_ids.at(token_idx));
                if producers_found.len() == 0 {
                    producers_found.append(producer);
                }
                assert(*producers_found.at(0) == producer, 'Different producers');
                token_idx += 1;
            };

            // Transfer the funds
            let total_price = producer_fee
                + self.calculate_fee(producer_fee, self.market_fee.read());
            let strk_token_dispatcher = IERC20Dispatcher {
                contract_address: contract_address_const::<STRK_TOKEN_ADDRESS>()
            };
            assert(strk_token_dispatcher.balance_of(buyer) >= total_price, 'insufficient funds');
            strk_token_dispatcher.transfer_from(buyer, contract_address, total_price);

            // Transfer the nft products
            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read()
            };
            cofi_collection
                .safe_batch_transfer_from(
                    contract_address, buyer, token_ids, token_amount, array![0].span()
                );

            self.emit(BuyBatchProducts { token_ids, token_amount, total_price });
            // Update stock for products
            let mut token_idx = 0;
            loop {
                if token_idx == token_ids.len() {
                    break;
                }
                let stock = self.listed_product_stock.read(*token_ids.at(token_idx));
                let token_amount = *token_amount.at(token_idx);
                let new_stock = stock - token_amount;
                self.update_stock(*token_ids.at(token_idx), new_stock);
                token_idx += 1;
            };

            if (!self.accesscontrol.has_role(CONSUMER, buyer)) {
                self.accesscontrol._grant_role(CONSUMER, buyer);
            }

            // Send payment to the producer
            let seller_address = *producers_found.at(0);
            self
                .claim_balances
                .write(seller_address, self.claim_balances.read(seller_address) + producer_fee);
            self.emit(PaymentSeller { token_ids, seller: seller_address, payment: producer_fee });
        }

        ///
        /// Adds a new product to the marketplace
        /// Arguments:
        /// * `initial_stock` - The amount of stock that the product will have
        /// * `price` - The price of the product per unity expresed in fri (1e-18 strk)
        /// * `data` - Additional context or metadata for the token transfer process
        fn create_product(
            ref self: ContractState, initial_stock: u256, price: u256, data: Span<felt252>
        ) {
            self.accesscontrol.assert_only_role(PRODUCER);
            let token_id = self.current_token_id.read();
            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read()
            };
            cofi_collection.mint(get_contract_address(), token_id, initial_stock, data);

            let producer = get_caller_address();
            self.seller_products.write(token_id, producer);

            self.current_token_id.write(token_id + 1);
            self.initialize_product(token_id, producer, initial_stock, price);
        }

        fn create_products(ref self: ContractState, initial_stock: Span<u256>, price: Span<u256>) {
            assert(initial_stock.len() == price.len(), 'wrong len of arrays');
            self.accesscontrol.assert_only_role(PRODUCER);
            let producer = get_caller_address();
            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read()
            };

            // Create token ids and mint the nfts
            let mut token_ids = array![];
            let current_token_id = self.current_token_id.read();
            let mut token_idx = 0;
            loop {
                if token_idx == initial_stock.len() {
                    break;
                }
                token_ids.append(current_token_id + token_idx.into());
                token_idx += 1;
            };
            cofi_collection
                .batch_mint(
                    get_contract_address(), token_ids.span(), initial_stock, array![0].span()
                );
            self.current_token_id.write(current_token_id + initial_stock.len().into());

            // Initialize the products
            token_idx = 0;
            loop {
                if token_idx == initial_stock.len() {
                    break;
                }
                self
                    .initialize_product(
                        *token_ids.at(token_idx),
                        producer,
                        *initial_stock.at(token_idx),
                        *price.at(token_idx)
                    );
                token_idx += 1;
            };
        }

        fn delete_product(ref self: ContractState, token_id: u256) {
            self.accesscontrol.assert_only_role(PRODUCER);
            let producer = get_caller_address();
            assert(self.seller_products.read(token_id) == producer, 'Not your product');

            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read()
            };
            let token_holder = get_contract_address();
            let amount_tokens = cofi_collection.balance_of(token_holder, token_id);
            self.update_stock(token_id, 0);
            cofi_collection.burn(token_holder, token_id, amount_tokens);
            self.emit(DeleteProduct { token_id });
        }

        fn delete_products(ref self: ContractState, token_ids: Span<u256>) {
            self.accesscontrol.assert_only_role(PRODUCER);
            let producer = get_caller_address();
            let mut token_idx = 0;
            // Check that all nfts belongs to the caller
            loop {
                if token_idx == token_ids.len() {
                    break;
                }
                let token_id = *token_ids.at(token_idx);
                assert(self.seller_products.read(token_id) == producer, 'Not your product');
                token_idx += 1;
            };

            // Burn nfts
            token_idx = 0;
            let token_holder = get_contract_address();
            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read()
            };
            loop {
                if token_idx == token_ids.len() {
                    break;
                }
                let token_id = *token_ids.at(token_idx);
                let amount_tokens = cofi_collection.balance_of(token_holder, token_id);
                self.update_stock(token_id, 0);
                cofi_collection.burn(token_holder, token_id, amount_tokens);
                self.emit(DeleteProduct { token_id });
            };
        }

        fn claim(ref self: ContractState) {
            self.accesscontrol.assert_only_role(PRODUCER);
            let producer = get_caller_address();
            let claim_balance = self.claim_balances.read(producer);
            assert(claim_balance > 0, 'No tokens to claim');
            let strk_token_dispatcher = IERC20Dispatcher {
                contract_address: contract_address_const::<STRK_TOKEN_ADDRESS>()
            };
            strk_token_dispatcher.approve(producer, claim_balance);
            let transfer = strk_token_dispatcher
                .transfer_from(get_contract_address(), producer, claim_balance);
            assert(transfer, 'Error claiming');

            self.claim_balances.write(producer, 0);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn initialize_product(
            ref self: ContractState,
            token_id: u256,
            producer: ContractAddress,
            stock: u256,
            price: u256
        ) {
            //let product = Product { stock, price };
            //self.seller_products.entry(producer).write(token_id);
            self.listed_product_stock.write(token_id, stock);
            self.listed_product_price.write(token_id, price);
            self.emit(CreateProduct { token_id, initial_stock: stock });
        }

        fn update_stock(ref self: ContractState, token_id: u256, new_stock: u256) {
            self.listed_product_stock.write(token_id, new_stock);
            self.emit(UpdateStock { token_id, new_stock });
        }

        // Amount is the total amount
        // BPS is the percentage you want to calculate. (Example: 2.5% = 250bps, 7,48% = 748bps)
        // Use example:
        // Calculate the 3% fee of 250 STRK
        // calculate_fee(250, 300) = 7.5
        fn calculate_fee(ref self: ContractState, amount: u256, bps: u256) -> u256 {
            assert((amount * bps) >= 10_000, 'Fee too low');
            amount * bps / 10_000
        }
    }
}
