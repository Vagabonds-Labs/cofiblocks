// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^0.15.0

use ekubo::types::delta::Delta;
use ekubo::types::keys::PoolKey;
use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, PartialEq)]
pub enum PAYMENT_TOKEN {
    STRK,
    USDC,
    USDT,
}

#[derive(Drop, Copy, Serde)]
struct SwapAfterLockParameters {
    contract_address: ContractAddress,
    to: ContractAddress,
    sell_token_address: ContractAddress,
    sell_token_amount: u256,
    buy_token_address: ContractAddress,
    pool_key: PoolKey,
    sqrt_ratio_distance: u256,
}

#[derive(Copy, Drop, Serde)]
struct SwapResult {
    delta: Delta,
}

#[starknet::interface]
pub trait IMarketplace<ContractState> {
    fn assign_producer_role(ref self: ContractState, assignee: ContractAddress);
    fn assign_roaster_role(ref self: ContractState, assignee: ContractAddress);
    fn assign_cambiatus_role(ref self: ContractState, assignee: ContractAddress);
    fn assign_cofiblocks_role(ref self: ContractState, assignee: ContractAddress);
    fn assign_cofounder_role(ref self: ContractState, assignee: ContractAddress);
    fn assign_consumer_role(ref self: ContractState, assignee: ContractAddress);
    fn assign_admin_role(ref self: ContractState, assignee: ContractAddress);
    fn buy_product(
        ref self: ContractState, token_id: u256, token_amount: u256, payment_token: PAYMENT_TOKEN,
    );
    fn buy_products(
        ref self: ContractState,
        token_ids: Span<u256>,
        token_amount: Span<u256>,
        payment_token: PAYMENT_TOKEN,
    );
    fn create_product(
        ref self: ContractState, initial_stock: u256, price: u256, data: Span<felt252>,
    ) -> u256;
    fn create_products(
        ref self: ContractState, initial_stock: Span<u256>, price: Span<u256>,
    ) -> Span<u256>;
    fn get_product_price(
        self: @ContractState, token_id: u256, token_amount: u256, payment_token: PAYMENT_TOKEN,
    ) -> u256;
    fn delete_product(ref self: ContractState, token_id: u256);
    fn delete_products(ref self: ContractState, token_ids: Span<u256>);
    fn claim_consumer(ref self: ContractState);
    fn claim_producer(ref self: ContractState);
    fn claim_roaster(ref self: ContractState);
    fn claim_cambiatus(ref self: ContractState);
    fn claim_cofiblocks(ref self: ContractState);
    fn claim_cofounder(ref self: ContractState);
    fn locked(ref self: ContractState, id: u32, data: Array<felt252>) -> Array<felt252>;
    fn withdraw(ref self: ContractState, token: PAYMENT_TOKEN);
    fn claim_payment(ref self: ContractState);
    fn get_claim_payment(self: @ContractState, wallet_address: ContractAddress) -> u256;
}

pub mod MainnetConfig {
    pub const USDT_ADDRESS: felt252 =
        0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8;

    pub const STRK_ADDRESS: felt252 =
        0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;

    // https://app.ekubo.org/positions/new?baseCurrency=USDC&quoteCurrency=USDT&step=1&initialTick=-20083671&fee=34028236692093847977029636859101184&tickSpacing=200&tickLower=-96800&tickUpper=136200
    pub const USDT_USDC_POOL_KEY: u128 = 34028236692093847977029636859101184;
    pub const USDT_USDC_TICK_SPACING: u128 = 200;

    // https://app.ekubo.org/positions/new?baseCurrency=STRK&quoteCurrency=USDC&step=1&initialTick=-20083671&fee=170141183460469235273462165868118016&tickSpacing=1000&tickLower=-29711000&tickUpper=-29679000
    pub const STARK_USDC_POOL_KEY: u128 = 170141183460469235273462165868118016;
    pub const STARK_USDC_TICK_SPACING: u128 = 1000;

    pub const USDC_ADDRESS: felt252 =
        0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8;

    pub const EKUBO_ADDRESS: felt252 =
        0x00000005dd3D2F4429AF886cD1a3b08289DBcEa99A294197E9eB43b0e0325b4b;
}

#[starknet::contract]
mod Marketplace {
    use contracts::cofi_collection::{ICofiCollectionDispatcher, ICofiCollectionDispatcherTrait};
    use contracts::distribution::{IDistributionDispatcher, IDistributionDispatcherTrait};
    use ekubo::components::shared_locker::{check_caller_is_core, handle_delta};
    use ekubo::interfaces::core::{ICoreDispatcher, ICoreDispatcherTrait, SwapParameters};
    use ekubo::types::i129::i129;
    use ekubo::types::keys::PoolKey;
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc1155::erc1155_receiver::ERC1155ReceiverComponent;
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::upgrades::UpgradeableComponent;
    use starknet::event::EventEmitter;
    use starknet::storage::Map;
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use super::{MainnetConfig, PAYMENT_TOKEN, SwapAfterLockParameters, SwapResult};

    component!(
        path: ERC1155ReceiverComponent, storage: erc1155_receiver, event: ERC1155ReceiverEvent,
    );
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    // Role definition
    const PRODUCER: felt252 = selector!("PRODUCER");
    const ROASTER: felt252 = selector!("ROASTER");
    const CAMBIATUS: felt252 = selector!("CAMBIATUS");
    const COFIBLOCKS: felt252 = selector!("COFIBLOCKS");
    const COFOUNDER: felt252 = selector!("COFOUNDER");
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

    const MIN_SQRT_RATIO: u256 = 18446748437148339061;
    const MAX_SQRT_RATIO: u256 = 6277100250585753475930931601400621808602321654880405518632;
    const TWO_E128: u256 = 340282366920938463463374607431768211456;
    const ONE_E12: u256 = 1000000000000;

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
        distribution: IDistributionDispatcher,
        market_fee: u256,
        listed_product_stock: Map<u256, u256>,
        listed_product_price: Map<u256, u256>,
        seller_products: Map<u256, ContractAddress>,
        seller_is_producer: Map<u256, bool>,
        cofi_collection_address: ContractAddress,
        claim_balances: Map<ContractAddress, u256>,
        current_token_id: u256,
        ekubo: ICoreDispatcher,
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
    /// * `ekubo_address` - The address of the Ekubo contract
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
        distribution_address: ContractAddress,
        admin: ContractAddress,
        market_fee: u256,
    ) {
        self.erc1155_receiver.initializer();
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, admin);
        self.cofi_collection_address.write(cofi_collection_address);
        self.distribution.write(IDistributionDispatcher { contract_address: distribution_address });
        self
            .ekubo
            .write(
                ICoreDispatcher {
                    contract_address: MainnetConfig::EKUBO_ADDRESS.try_into().unwrap(),
                },
            );
        self.market_fee.write(market_fee);
        self.current_token_id.write(1);
    }

    #[abi(embed_v0)]
    impl MarketplaceImpl of super::IMarketplace<ContractState> {
        fn locked(ref self: ContractState, id: u32, data: Array<felt252>) -> Array<felt252> {
            // This function can only be called by ekubo
            let ekubo = self.ekubo.read();
            check_caller_is_core(ekubo);

            // Deserialize data
            let mut input_span = data.span();
            let mut params = Serde::<SwapAfterLockParameters>::deserialize(ref input_span)
                .expect('Invalid callback data');

            let is_token1 = params.pool_key.token1 == params.sell_token_address;
            // Swap
            assert(params.sell_token_amount.high == 0, 'Overflow: Unsupported amount');
            let pool_price = ekubo.get_pool_price(params.pool_key);
            let sqrt_ratio_limit = self
                .compute_sqrt_ratio_limit(
                    pool_price.sqrt_ratio,
                    params.sqrt_ratio_distance,
                    is_token1,
                    MIN_SQRT_RATIO,
                    MAX_SQRT_RATIO,
                );

            let swap_params = SwapParameters {
                amount: i129 { mag: params.sell_token_amount.low, sign: false },
                is_token1,
                sqrt_ratio_limit,
                skip_ahead: 100,
            };
            let mut delta = ekubo.swap(params.pool_key, swap_params);

            let pay_amount = if is_token1 {
                delta.amount1
            } else {
                delta.amount0
            };

            let buy_amount = if is_token1 {
                delta.amount0
            } else {
                delta.amount1
            };

            // Pay the tokens we owe for the swap
            handle_delta(
                core: ekubo,
                token: params.sell_token_address,
                delta: pay_amount,
                recipient: params.to,
            );

            // Receive the tokens we bought
            handle_delta(
                core: ekubo,
                token: params.buy_token_address,
                delta: buy_amount,
                recipient: params.to,
            );

            let swap_result = SwapResult { delta };
            let mut arr: Array<felt252> = ArrayTrait::new();
            Serde::serialize(@swap_result, ref arr);
            arr
        }

        fn assign_producer_role(ref self: ContractState, assignee: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(PRODUCER, assignee);
        }

        fn assign_roaster_role(ref self: ContractState, assignee: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(ROASTER, assignee);
        }

        fn assign_cambiatus_role(ref self: ContractState, assignee: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(CAMBIATUS, assignee);
        }

        fn assign_cofiblocks_role(ref self: ContractState, assignee: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(COFIBLOCKS, assignee);
        }

        fn assign_cofounder_role(ref self: ContractState, assignee: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(COFOUNDER, assignee);

            let distribution = self.distribution.read();
            distribution.add_cofounder(assignee);
        }

        fn assign_consumer_role(ref self: ContractState, assignee: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(CONSUMER, assignee);
        }

        fn assign_admin_role(ref self: ContractState, assignee: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, assignee);
        }

        fn buy_product(
            ref self: ContractState,
            token_id: u256,
            token_amount: u256,
            payment_token: PAYMENT_TOKEN,
        ) {
            let stock = self.listed_product_stock.read(token_id);
            assert(stock >= token_amount, 'Not enough stock');

            let buyer = get_caller_address();
            let contract_address = get_contract_address();

            let mut producer_fee = self.listed_product_price.read(token_id) * token_amount;
            let mut total_required_tokens = self
                .get_product_price(token_id, token_amount, payment_token);

            // Process payment
            if payment_token == PAYMENT_TOKEN::STRK {
                let strk_address = MainnetConfig::STRK_ADDRESS.try_into().unwrap();
                self.pay_with_token(strk_address, total_required_tokens);
                self.swap_token_for_usdc(strk_address, total_required_tokens);
            } else if payment_token == PAYMENT_TOKEN::USDC {
                let usdc_address = MainnetConfig::USDC_ADDRESS.try_into().unwrap();
                self.pay_with_token(usdc_address, total_required_tokens);
            } else if payment_token == PAYMENT_TOKEN::USDT {
                let usdt_address = MainnetConfig::USDT_ADDRESS.try_into().unwrap();
                self.pay_with_token(usdt_address, total_required_tokens);
                self.swap_token_for_usdc(usdt_address, total_required_tokens);
            } else {
                assert(false, 'Invalid payment token');
            }

            // Transfer the nft products
            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read(),
            };
            cofi_collection
                .safe_transfer_from(
                    contract_address, buyer, token_id, token_amount, array![0].span(),
                );

            // Update stock
            let new_stock = stock - token_amount;
            self.update_stock(token_id, new_stock);

            self.emit(BuyProduct { token_id, amount: token_amount, price: total_required_tokens });
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

            // Register purchase in the distribution contract
            let distribution = self.distribution.read();
            let profit = self.calculate_fee(producer_fee, self.market_fee.read());
            let is_producer = self.seller_is_producer.read(token_id);
            distribution
                .register_purchase(buyer, seller_address, is_producer, producer_fee, profit);
        }

        fn buy_products(
            ref self: ContractState,
            token_ids: Span<u256>,
            token_amount: Span<u256>,
            payment_token: PAYMENT_TOKEN,
        ) {
            assert(token_ids.len() > 0, 'No products to buy');
            assert(token_ids.len() == token_amount.len(), 'wrong length of arrays');
            let buyer = get_caller_address();
            let contract_address = get_contract_address();

            // Check if the buyer has enough funds to buy all the products
            let mut token_idx = 0;
            let mut producer_fee = 0_u256;
            let mut producers_found = array![];
            let mut total_required_tokens = 0_u256;
            let distribution = self.distribution.read();
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
                total_required_tokens += self
                    .get_product_price(*token_ids.at(token_idx), token_amount, payment_token);
                let producer = self.seller_products.read(*token_ids.at(token_idx));
                if producers_found.len() == 0 {
                    producers_found.append(producer);
                }
                assert(*producers_found.at(0) == producer, 'Different producers');
                token_idx += 1;
            }

            // Process payment
            if payment_token == PAYMENT_TOKEN::STRK {
                let strk_address = MainnetConfig::STRK_ADDRESS.try_into().unwrap();
                self.pay_with_token(strk_address, total_required_tokens);
                self.swap_token_for_usdc(strk_address, total_required_tokens);
            } else if payment_token == PAYMENT_TOKEN::USDC {
                let usdc_address = MainnetConfig::USDC_ADDRESS.try_into().unwrap();
                self.pay_with_token(usdc_address, total_required_tokens);
            } else if payment_token == PAYMENT_TOKEN::USDT {
                let usdt_address = MainnetConfig::USDT_ADDRESS.try_into().unwrap();
                self.pay_with_token(usdt_address, total_required_tokens);
                self.swap_token_for_usdc(usdt_address, total_required_tokens);
            } else {
                assert(false, 'Invalid payment token');
            }

            // Transfer the nft products
            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read(),
            };
            cofi_collection
                .safe_batch_transfer_from(
                    contract_address, buyer, token_ids, token_amount, array![0].span(),
                );

            self
                .emit(
                    BuyBatchProducts {
                        token_ids, token_amount, total_price: total_required_tokens,
                    },
                );
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
            }

            if (!self.accesscontrol.has_role(CONSUMER, buyer)) {
                self.accesscontrol._grant_role(CONSUMER, buyer);
            }

            // Send payment to the producer
            let seller_address = *producers_found.at(0);
            self
                .claim_balances
                .write(seller_address, self.claim_balances.read(seller_address) + producer_fee);
            self.emit(PaymentSeller { token_ids, seller: seller_address, payment: producer_fee });

            // Register purchase in the distribution contract
            token_idx = 0;
            loop {
                if token_idx == token_ids.len() {
                    break;
                }
                let token_amount = *token_amount.at(token_idx);
                let token_id = *token_ids.at(token_idx);
                let producer_fee = self.listed_product_price.read(token_id) * token_amount;
                let profit = self.calculate_fee(producer_fee, self.market_fee.read());
                let is_producer = self.seller_is_producer.read(token_id);
                distribution
                    .register_purchase(buyer, seller_address, is_producer, producer_fee, profit);
                token_idx += 1;
            }
        }

        ///
        /// Adds a new product to the marketplace
        /// Arguments:
        /// * `initial_stock` - The amount of stock that the product will have
        /// * `price` - The price of the product per unity expresed in usdc (1e-6 usdc)
        /// * `data` - Additional context or metadata for the token transfer process
        fn create_product(
            ref self: ContractState, initial_stock: u256, price: u256, data: Span<felt252>,
        ) -> u256 {
            let is_producer = self.accesscontrol.has_role(PRODUCER, get_caller_address());
            let is_roaster = self.accesscontrol.has_role(ROASTER, get_caller_address());
            assert(is_producer || is_roaster, 'Not producer or roaster');

            let token_id = self.current_token_id.read();
            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read(),
            };
            cofi_collection.mint(get_contract_address(), token_id, initial_stock, data);

            let producer = get_caller_address();

            self.current_token_id.write(token_id + 1);
            self.initialize_product(token_id, producer, initial_stock, price, is_producer);
            token_id
        }

        fn create_products(
            ref self: ContractState, initial_stock: Span<u256>, price: Span<u256>,
        ) -> Span<u256> {
            assert(initial_stock.len() == price.len(), 'wrong len of arrays');

            let is_producer = self.accesscontrol.has_role(PRODUCER, get_caller_address());
            let is_roaster = self.accesscontrol.has_role(ROASTER, get_caller_address());
            assert(is_producer || is_roaster, 'Not producer or roaster');

            let producer = get_caller_address();
            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read(),
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
            }
            cofi_collection
                .batch_mint(
                    get_contract_address(), token_ids.span(), initial_stock, array![0].span(),
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
                        *price.at(token_idx),
                        is_producer,
                    );
                token_idx += 1;
            }
            token_ids.span()
        }

        fn get_product_price(
            self: @ContractState, token_id: u256, token_amount: u256, payment_token: PAYMENT_TOKEN,
        ) -> u256 {
            let stock = self.listed_product_stock.read(token_id);
            assert(stock > 0, 'Product not available');

            let mut product_price = self.listed_product_price.read(token_id) * token_amount;
            let mut total_price = product_price
                + self.calculate_fee(product_price, self.market_fee.read());

            // Process payment
            if payment_token == PAYMENT_TOKEN::STRK {
                return self.usdc_to_strk_wei(total_price);
            } else if payment_token == PAYMENT_TOKEN::USDC || payment_token == PAYMENT_TOKEN::USDT {
                return total_price;
            } else {
                assert(false, 'Invalid payment token');
                return 0;
            }
        }

        fn delete_product(ref self: ContractState, token_id: u256) {
            let is_producer = self.accesscontrol.has_role(PRODUCER, get_caller_address());
            let is_roaster = self.accesscontrol.has_role(ROASTER, get_caller_address());
            assert(is_producer || is_roaster, 'Not producer or roaster');

            let producer = get_caller_address();
            assert(self.seller_products.read(token_id) == producer, 'Not your product');

            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read(),
            };
            let token_holder = get_contract_address();
            let amount_tokens = cofi_collection.balance_of(token_holder, token_id);
            self.update_stock(token_id, 0);
            cofi_collection.burn(token_holder, token_id, amount_tokens);
            self.emit(DeleteProduct { token_id });
        }

        fn delete_products(ref self: ContractState, token_ids: Span<u256>) {
            let is_producer = self.accesscontrol.has_role(PRODUCER, get_caller_address());
            let is_roaster = self.accesscontrol.has_role(ROASTER, get_caller_address());
            assert(is_producer || is_roaster, 'Not producer or roaster');

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
            }

            // Burn nfts
            token_idx = 0;
            let token_holder = get_contract_address();
            let cofi_collection = ICofiCollectionDispatcher {
                contract_address: self.cofi_collection_address.read(),
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
                token_idx += 1;
            };
        }

        fn claim_consumer(ref self: ContractState) {
            self.accesscontrol.assert_only_role(CONSUMER);
            let buyer = get_caller_address();
            let distribution = self.distribution.read();
            let claim_balance = distribution.coffee_lover_claim_balance(buyer);
            self.claim_balance(claim_balance, buyer);
            distribution.coffee_lover_claim_reset(buyer);
        }

        fn claim_producer(ref self: ContractState) {
            self.accesscontrol.assert_only_role(PRODUCER);
            let producer = get_caller_address();
            let distribution = self.distribution.read();
            let claim_balance = distribution.producer_claim_balance(producer);
            self.claim_balance(claim_balance, producer);
            distribution.producer_claim_reset(producer);
        }

        fn claim_roaster(ref self: ContractState) {
            self.accesscontrol.assert_only_role(ROASTER);
            let roaster = get_caller_address();
            let distribution = self.distribution.read();
            let claim_balance = distribution.roaster_claim_balance(roaster);
            self.claim_balance(claim_balance, roaster);
            distribution.roaster_claim_reset(roaster);
        }

        fn claim_cambiatus(ref self: ContractState) {
            self.accesscontrol.assert_only_role(CAMBIATUS);
            let distribution = self.distribution.read();
            let claim_balance = distribution.cambiatus_claim_balance();
            self.claim_balance(claim_balance, get_caller_address());
            distribution.cambiatus_claim_reset();
        }

        fn claim_cofiblocks(ref self: ContractState) {
            self.accesscontrol.assert_only_role(COFIBLOCKS);
            let distribution = self.distribution.read();
            let claim_balance = distribution.cofiblocks_claim_balance();
            self.claim_balance(claim_balance, get_caller_address());
            distribution.cofiblocks_claim_reset();
        }

        fn claim_cofounder(ref self: ContractState) {
            self.accesscontrol.assert_only_role(COFOUNDER);
            let cofounder = get_caller_address();
            let distribution = self.distribution.read();
            let claim_balance = distribution.cofounder_claim_balance(cofounder);
            self.claim_balance(claim_balance, cofounder);
            distribution.cofounder_claim_reset(cofounder);
        }

        fn withdraw(ref self: ContractState, token: PAYMENT_TOKEN) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            let token_address = match token {
                PAYMENT_TOKEN::STRK => MainnetConfig::STRK_ADDRESS.try_into().unwrap(),
                PAYMENT_TOKEN::USDC => MainnetConfig::USDC_ADDRESS.try_into().unwrap(),
                PAYMENT_TOKEN::USDT => MainnetConfig::USDT_ADDRESS.try_into().unwrap(),
            };
            let token_dispatcher = IERC20Dispatcher { contract_address: token_address };
            let balance = token_dispatcher.balance_of(get_contract_address());
            assert(balance >= 0, 'No tokens to withdraw');
            let transfer = token_dispatcher.transfer(get_caller_address(), balance);
            assert(transfer, 'Error withdrawing');
        }

        fn claim_payment(ref self: ContractState) {
            // Producers/roasters should call this function to receive their payment
            let balance = self.claim_balances.read(get_caller_address());
            self.claim_balance(balance, get_caller_address());
            self.claim_balances.write(get_caller_address(), 0);
        }

        fn get_claim_payment(self: @ContractState, wallet_address: ContractAddress) -> u256 {
            // Producers/roasters can read their claim payment from here
            self.claim_balances.read(wallet_address)
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn initialize_product(
            ref self: ContractState,
            token_id: u256,
            producer: ContractAddress,
            stock: u256,
            price: u256,
            is_producer: bool,
        ) {
            //let product = Product { stock, price };
            self.seller_products.write(token_id, producer);
            self.seller_is_producer.write(token_id, is_producer);
            self.listed_product_stock.write(token_id, stock);
            self.listed_product_price.write(token_id, price);
            self.emit(CreateProduct { token_id, initial_stock: stock });
        }

        fn claim_balance(ref self: ContractState, claim_balance: u256, recipient: ContractAddress) {
            assert(claim_balance > 0, 'No tokens to claim');

            let usdc_token_dispatcher = IERC20Dispatcher {
                contract_address: MainnetConfig::USDC_ADDRESS.try_into().unwrap(),
            };
            let marketplace_balance = usdc_token_dispatcher.balance_of(get_contract_address());
            assert(claim_balance <= marketplace_balance, 'Contract insufficient balance');
            let transfer = usdc_token_dispatcher.transfer(recipient, claim_balance);
            assert(transfer, 'Error claiming');
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
        fn calculate_fee(self: @ContractState, amount: u256, bps: u256) -> u256 {
            assert((amount * bps) >= 10_000, 'Fee too low');
            amount * bps / 10_000
        }

        fn pay_with_token(ref self: ContractState, token_address: ContractAddress, amount: u256) {
            let token_dispatcher = IERC20Dispatcher { contract_address: token_address };
            let contract_address = get_contract_address();
            let caller = get_caller_address();
            assert(
                token_dispatcher.balance_of(get_caller_address()) >= amount, 'insufficient funds',
            );
            assert(
                token_dispatcher.allowance(caller, contract_address) >= amount,
                'insufficient allowance',
            );
            let success = token_dispatcher.transfer_from(caller, contract_address, amount);
            assert(success, 'Error transferring tokens');
        }

        fn usdc_to_strk_wei(self: @ContractState, amount_usdc: u256) -> u256 {
            let ekubo = self.ekubo.read();
            let usdc_stark_pool_key = PoolKey {
                token0: MainnetConfig::STRK_ADDRESS.try_into().unwrap(),
                token1: MainnetConfig::USDC_ADDRESS.try_into().unwrap(),
                fee: MainnetConfig::STARK_USDC_POOL_KEY,
                tick_spacing: MainnetConfig::STARK_USDC_TICK_SPACING,
                extension: 0x00.try_into().unwrap(),
            };
            let pool_price = ekubo.get_pool_price(usdc_stark_pool_key);

            // To extract the price, formula is ((sqrt_ratio)/(2^128)) ^ 2.
            // USDC has 6 decimals meanwhile STRK has 18 decimals. So padding is needed.
            let price_without_pow = (pool_price.sqrt_ratio * ONE_E12) / TWO_E128;
            let stark_price = price_without_pow * price_without_pow;

            // The amount of starks expresed in 10^6 representation (6 decimals)
            let starks_required = (amount_usdc * ONE_E12) / stark_price;
            // output should be in 10^18 representation (wei) so padding with 12 zeros
            starks_required * ONE_E12
        }

        fn compute_sqrt_ratio_limit(
            ref self: ContractState,
            sqrt_ratio: u256,
            distance: u256,
            is_token1: bool,
            min: u256,
            max: u256,
        ) -> u256 {
            let mut sqrt_ratio_limit = if is_token1 {
                if (distance > max) {
                    max
                } else {
                    sqrt_ratio + distance
                }
            } else {
                if (distance > sqrt_ratio) {
                    min
                } else {
                    sqrt_ratio - distance
                }
            };
            if (sqrt_ratio_limit < min) {
                sqrt_ratio_limit = min;
            }
            if (sqrt_ratio_limit > max) {
                sqrt_ratio_limit = max;
            }
            sqrt_ratio_limit
        }

        fn swap_token_for_usdc(
            ref self: ContractState, sell_token_address: ContractAddress, sell_token_amount: u256,
        ) {
            let usdc_address = MainnetConfig::USDC_ADDRESS.try_into().unwrap();
            let is_stark = sell_token_address == MainnetConfig::STRK_ADDRESS.try_into().unwrap();
            let pool_key = if is_stark {
                PoolKey {
                    token0: sell_token_address,
                    token1: usdc_address,
                    fee: MainnetConfig::STARK_USDC_POOL_KEY,
                    tick_spacing: MainnetConfig::STARK_USDC_TICK_SPACING,
                    extension: 0x00.try_into().unwrap(),
                }
            } else {
                PoolKey {
                    token0: usdc_address,
                    token1: sell_token_address,
                    fee: MainnetConfig::USDT_USDC_POOL_KEY,
                    tick_spacing: MainnetConfig::USDT_USDC_TICK_SPACING,
                    extension: 0x00.try_into().unwrap(),
                }
            };

            // This number was obteined through testing, its emprical
            let sqrt_ratio_distance = 184467484371483390610000000000000000;
            let callback = SwapAfterLockParameters {
                contract_address: self.ekubo.read().contract_address,
                to: get_contract_address(),
                sell_token_address,
                sell_token_amount,
                buy_token_address: usdc_address,
                pool_key,
                sqrt_ratio_distance,
            };

            let mut data: Array<felt252> = ArrayTrait::new();
            Serde::<SwapAfterLockParameters>::serialize(@callback, ref data);

            // Lock
            let ekubo = self.ekubo.read();
            ekubo.lock(data.span());
        }
    }
}
