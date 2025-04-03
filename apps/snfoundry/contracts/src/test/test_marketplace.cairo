mod test_marketplace {
    use contracts::cofi_collection::ICofiCollectionDispatcher;
    use contracts::cofi_collection::ICofiCollectionDispatcherTrait;
    use contracts::marketplace::{
        IMarketplaceDispatcher, IMarketplaceDispatcherTrait, PAYMENT_TOKEN, MainnetConfig
    };
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    use openzeppelin::utils::serde::SerializedAppend;
    use snforge_std::{
        declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address,
        stop_cheat_caller_address, cheat_caller_address, CheatSpan
    };
    use starknet::ContractAddress;
    use starknet::syscalls::call_contract_syscall;

    fn OWNER() -> ContractAddress {
        starknet::contract_address_const::<'OWNER'>()
    }

    const STRK_TOKEN_MINTER_ADDRESS: felt252 =
        0x0594c1582459ea03f77deaf9eb7e3917d6994a03c13405ba42867f83d85f085d;

    const USDT_TOKEN_MINTER_ADDRESS: felt252 =
        0x074761a8d48ce002963002becc6d9c3dd8a2a05b1075d55e5967f42296f16bd0;

    const ONE_E18: u256 = 1000000000000000000_u256;
    const ONE_E6: u256 = 1000000_u256;
    const MARKET_FEE: u256 = 250_u256; // 2.5%

    fn deploy_receiver() -> ContractAddress {
        let contract = declare("Receiver").unwrap().contract_class();
        let calldata = array![];
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        contract_address
    }

    fn deploy_cofi_collection() -> ICofiCollectionDispatcher {
        let contract = declare("CofiCollection").unwrap().contract_class();

        let mut calldata: Array<felt252> = array![];
        calldata.append_serde(OWNER()); // default_admin
        calldata.append_serde(OWNER()); // pauser
        calldata.append_serde(OWNER()); // minter
        calldata.append_serde(OWNER()); // uri_setter
        calldata.append_serde(OWNER()); // upgrader

        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        let cofi_collection = ICofiCollectionDispatcher { contract_address };

        cofi_collection
    }

    fn deploy_marketplace(cofi_collection: ContractAddress) -> IMarketplaceDispatcher {
        let contract = declare("Marketplace").unwrap().contract_class();

        let mut calldata: Array<felt252> = array![];
        calldata.append_serde(cofi_collection); // coffi_collection
        calldata.append_serde(OWNER()); // admin
        calldata.append_serde(MARKET_FEE); // market fee

        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        let marketplace = IMarketplaceDispatcher { contract_address };

        marketplace
    }

    fn calculate_total_token_price(unit_price: u256, amount: u256) -> u256 {
        let total_price = unit_price * amount;
        let market_fee = total_price * MARKET_FEE / 10000;
        total_price + market_fee
    }

    #[test]
    fn test_assign_seller_role() {
        let cofi_collection = deploy_cofi_collection();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        start_cheat_caller_address(marketplace.contract_address, OWNER());
        marketplace.assign_seller_role(OWNER());
    }

    #[test]
    fn test_assign_consumer_role() {
        let cofi_collection = deploy_cofi_collection();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        start_cheat_caller_address(marketplace.contract_address, OWNER());
        marketplace.assign_consumer_role(OWNER());
    }

    #[test]
    fn test_assign_admin_role() {
        let cofi_collection = deploy_cofi_collection();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        start_cheat_caller_address(marketplace.contract_address, OWNER());
        let ANYONE = starknet::contract_address_const::<'ANYONE'>();
        marketplace.assign_admin_role(ANYONE);
    }

    #[test]
    fn test_create_product() {
        let cofi_collection = deploy_cofi_collection();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        // Create a producer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        let PRODUCER = starknet::contract_address_const::<'PRODUCER'>();
        marketplace.assign_seller_role(PRODUCER);

        // Give marketplace permission to mint tokens
        start_cheat_caller_address(cofi_collection.contract_address, OWNER());
        cofi_collection.set_minter(marketplace.contract_address);

        // Create a product
        start_cheat_caller_address(marketplace.contract_address, PRODUCER);
        let data = array!['testing'].span();
        let price = 1 * ONE_E18; // 1 stark
        let token_id = marketplace.create_product(10, price, data);
        assert(token_id == 1, 'invalid token id');
    }

    #[test]
    fn test_create_products() {
        let cofi_collection = deploy_cofi_collection();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        // Create a producer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        let PRODUCER = starknet::contract_address_const::<'PRODUCER'>();
        marketplace.assign_seller_role(PRODUCER);

        // Give marketplace permission to mint tokens
        start_cheat_caller_address(cofi_collection.contract_address, OWNER());
        cofi_collection.set_minter(marketplace.contract_address);

        // Create a product
        start_cheat_caller_address(marketplace.contract_address, PRODUCER);
        let initial_stock = array![10, 9].span();
        let price = array![1 * ONE_E18, 2 * ONE_E18].span();
        let token_ids = marketplace.create_products(initial_stock, price);
        assert(token_ids == array![1, 2].span(), 'invalid token ids');
    }

    #[test]
    #[fork("MAINNET_LATEST")]
    fn test_buy_product_stark() {
        let cofi_collection = deploy_cofi_collection();
        let CONSUMER = deploy_receiver();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        // Create a producer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        let PRODUCER = starknet::contract_address_const::<'PRODUCER'>();
        marketplace.assign_seller_role(PRODUCER);

        // Give marketplace permission to mint tokens
        start_cheat_caller_address(cofi_collection.contract_address, OWNER());
        cofi_collection.set_minter(marketplace.contract_address);

        // Create a product
        start_cheat_caller_address(marketplace.contract_address, PRODUCER);
        let data = array!['testing'].span();
        let price = 40 * ONE_E6; // 1 USD
        let token_id = marketplace.create_product(10, price, data);

        // Create a consumer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        marketplace.assign_seller_role(CONSUMER);

        // Fund buyer wallet
        let amount_to_buy = 10;
        let total_price_in_stark = marketplace
            .get_product_price(token_id, amount_to_buy, PAYMENT_TOKEN::STRK);
        let minter_address = starknet::contract_address_const::<STRK_TOKEN_MINTER_ADDRESS>();
        let token_address = starknet::contract_address_const::<MainnetConfig::STRK_ADDRESS>();
        let token_dispatcher = IERC20Dispatcher { contract_address: token_address };

        start_cheat_caller_address(token_address, minter_address);
        let mut calldata = array![];
        calldata.append_serde(CONSUMER);
        calldata.append_serde(total_price_in_stark);
        call_contract_syscall(token_address, selector!("permissioned_mint"), calldata.span())
            .unwrap();

        assert(token_dispatcher.balance_of(CONSUMER) >= total_price_in_stark, 'invalid balance');

        // Approve marketplace to spend buyer's tokens
        start_cheat_caller_address(token_address, CONSUMER);
        token_dispatcher.approve(marketplace.contract_address, total_price_in_stark);

        // Buy a product
        cheat_caller_address(marketplace.contract_address, CONSUMER, CheatSpan::TargetCalls(1));
        stop_cheat_caller_address(token_address);
        stop_cheat_caller_address(cofi_collection.contract_address);
        marketplace.buy_product(token_id, amount_to_buy, PAYMENT_TOKEN::STRK);
        let stark_in_contract = token_dispatcher.balance_of(marketplace.contract_address);
        assert(stark_in_contract == 0, 'Failed to swap starks');

        let minted_nfts = cofi_collection.balance_of(CONSUMER, token_id);
        assert(minted_nfts == amount_to_buy, 'invalid minted nfts');

        // Check that the contract now has the expected balance in usdt
        let usdc_token_address = starknet::contract_address_const::<MainnetConfig::USDC_ADDRESS>();
        let usdc_token_dispatcher = IERC20Dispatcher { contract_address: usdc_token_address };
        let usdc_in_contract = usdc_token_dispatcher.balance_of(marketplace.contract_address);
        assert(usdc_in_contract >= price * amount_to_buy, 'invalid usdc in contract');
    }

    #[test]
    #[fork("MAINNET_LATEST")]
    fn test_buy_product_usdt() {
        let cofi_collection = deploy_cofi_collection();
        let CONSUMER = deploy_receiver();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        // Create a producer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        let PRODUCER = starknet::contract_address_const::<'PRODUCER'>();
        marketplace.assign_seller_role(PRODUCER);

        // Give marketplace permission to mint tokens
        start_cheat_caller_address(cofi_collection.contract_address, OWNER());
        cofi_collection.set_minter(marketplace.contract_address);

        // Create a product
        start_cheat_caller_address(marketplace.contract_address, PRODUCER);
        let data = array!['testing'].span();
        let price = 40 * ONE_E6; // 1 USD
        let token_id = marketplace.create_product(10, price, data);

        // Create a consumer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        marketplace.assign_seller_role(CONSUMER);

        // Fund buyer wallet
        let amount_to_buy = 10;
        let total_price_in_usdt = marketplace
            .get_product_price(token_id, amount_to_buy, PAYMENT_TOKEN::USDT);
        let minter_address = starknet::contract_address_const::<USDT_TOKEN_MINTER_ADDRESS>();
        let token_address = starknet::contract_address_const::<MainnetConfig::USDT_ADDRESS>();
        let token_dispatcher = IERC20Dispatcher { contract_address: token_address };

        start_cheat_caller_address(token_address, minter_address);
        let mut calldata = array![];
        calldata.append_serde(CONSUMER);
        calldata.append_serde(total_price_in_usdt);
        call_contract_syscall(token_address, selector!("permissioned_mint"), calldata.span())
            .unwrap();
        assert(token_dispatcher.balance_of(CONSUMER) >= total_price_in_usdt, 'invalid balance');

        // Approve marketplace to spend buyer's tokens
        start_cheat_caller_address(token_address, CONSUMER);
        token_dispatcher.approve(marketplace.contract_address, total_price_in_usdt);

        // Buy a product
        cheat_caller_address(marketplace.contract_address, CONSUMER, CheatSpan::TargetCalls(1));
        stop_cheat_caller_address(token_address);
        stop_cheat_caller_address(cofi_collection.contract_address);
        marketplace.buy_product(token_id, amount_to_buy, PAYMENT_TOKEN::USDT);
        let usdt_in_contract = token_dispatcher.balance_of(marketplace.contract_address);
        assert(usdt_in_contract == 0, 'Failed to swap usdt');

        let minted_nfts = cofi_collection.balance_of(CONSUMER, token_id);
        assert(minted_nfts == amount_to_buy, 'invalid minted nfts');

        // Check that the contract now has the expected balance in usdt
        let usdc_token_address = starknet::contract_address_const::<MainnetConfig::USDC_ADDRESS>();
        let usdc_token_dispatcher = IERC20Dispatcher { contract_address: usdc_token_address };
        let usdc_in_contract = usdc_token_dispatcher.balance_of(marketplace.contract_address);
        assert(usdc_in_contract >= price * amount_to_buy, 'invalid usdc in contract');
    }

    #[test]
    #[fork("MAINNET_LATEST")]
    fn test_buy_products() {
        let cofi_collection = deploy_cofi_collection();
        let CONSUMER = deploy_receiver();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        // Create a producer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        let PRODUCER = starknet::contract_address_const::<'PRODUCER'>();
        marketplace.assign_seller_role(PRODUCER);

        // Give marketplace permission to mint tokens
        start_cheat_caller_address(cofi_collection.contract_address, OWNER());
        cofi_collection.set_minter(marketplace.contract_address);

        // Create a product
        start_cheat_caller_address(marketplace.contract_address, PRODUCER);
        let initial_stock = array![10, 9].span();
        let price = array![1000000, 2000000].span();
        let token_ids = marketplace.create_products(initial_stock, price);

        // Create a consumer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        marketplace.assign_seller_role(CONSUMER);

        // Fund buyer wallet
        let minter_address = starknet::contract_address_const::<STRK_TOKEN_MINTER_ADDRESS>();
        let token_address = starknet::contract_address_const::<MainnetConfig::STRK_ADDRESS>();
        let token_dispatcher = IERC20Dispatcher { contract_address: token_address };

        let token1_price = marketplace.get_product_price(*token_ids.at(0), 2, PAYMENT_TOKEN::STRK);
        let token2_price = marketplace.get_product_price(*token_ids.at(1), 3, PAYMENT_TOKEN::STRK);
        let total_price_in_stark = token1_price + token2_price;

        start_cheat_caller_address(token_address, minter_address);
        let mut calldata = array![];
        calldata.append_serde(CONSUMER);
        calldata.append_serde(total_price_in_stark);
        call_contract_syscall(token_address, selector!("permissioned_mint"), calldata.span())
            .unwrap();

        assert(token_dispatcher.balance_of(CONSUMER) == total_price_in_stark, 'invalid balance');

        // Approve marketplace to spend buyer's tokens
        start_cheat_caller_address(token_address, CONSUMER);
        token_dispatcher.approve(marketplace.contract_address, total_price_in_stark);

        // Buy a product
        cheat_caller_address(marketplace.contract_address, CONSUMER, CheatSpan::TargetCalls(1));
        stop_cheat_caller_address(token_address);
        stop_cheat_caller_address(cofi_collection.contract_address);
        let token_amounts = array![2, 3].span();
        marketplace.buy_products(token_ids, token_amounts, PAYMENT_TOKEN::STRK);
    }

    #[test]
    fn test_delete_product() {
        let cofi_collection = deploy_cofi_collection();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        // Create a producer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        let PRODUCER = starknet::contract_address_const::<'PRODUCER'>();
        marketplace.assign_seller_role(PRODUCER);

        // Give marketplace permission to mint tokens
        start_cheat_caller_address(cofi_collection.contract_address, OWNER());
        cofi_collection.set_minter(marketplace.contract_address);

        // Create a product
        start_cheat_caller_address(marketplace.contract_address, PRODUCER);
        let data = array!['testing'].span();
        let price = 1 * ONE_E18; // 1 stark
        let token_id = marketplace.create_product(10, price, data);
        assert(token_id == 1, 'invalid token id');

        // Delete the product
        start_cheat_caller_address(cofi_collection.contract_address, marketplace.contract_address);
        let tokens_before = cofi_collection.balance_of(marketplace.contract_address, token_id);
        assert(tokens_before == 10, 'invalid tokens before');

        marketplace.delete_product(token_id);
        let tokens_after = cofi_collection.balance_of(marketplace.contract_address, token_id);
        assert(tokens_after == 0, 'invalid tokens after');
    }

    #[test]
    fn test_delete_products() {
        let cofi_collection = deploy_cofi_collection();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        // Create a producer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        let PRODUCER = starknet::contract_address_const::<'PRODUCER'>();
        marketplace.assign_seller_role(PRODUCER);

        // Give marketplace permission to mint tokens
        start_cheat_caller_address(cofi_collection.contract_address, OWNER());
        cofi_collection.set_minter(marketplace.contract_address);

        // Create products
        start_cheat_caller_address(marketplace.contract_address, PRODUCER);
        let initial_stock = array![10, 9].span();
        let price = array![1 * ONE_E18, 2 * ONE_E18].span();
        let token_ids = marketplace.create_products(initial_stock, price);

        // Delete the product
        start_cheat_caller_address(cofi_collection.contract_address, marketplace.contract_address);
        let tokens_before = cofi_collection
            .balance_of(marketplace.contract_address, *token_ids.at(0));
        assert(tokens_before == 10, 'invalid tokens before');

        marketplace.delete_products(token_ids);
        let tokens_after = cofi_collection
            .balance_of(marketplace.contract_address, *token_ids.at(0));
        assert(tokens_after == 0, 'invalid tokens after');
    }

    #[test]
    #[fork("MAINNET_LATEST")]
    fn test_claim() {
        let cofi_collection = deploy_cofi_collection();
        let CONSUMER = deploy_receiver();
        let PRODUCER = deploy_receiver();
        let marketplace = deploy_marketplace(cofi_collection.contract_address);

        // Create a producer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        marketplace.assign_seller_role(PRODUCER);

        // Give marketplace permission to mint tokens
        start_cheat_caller_address(cofi_collection.contract_address, OWNER());
        cofi_collection.set_minter(marketplace.contract_address);

        // Create a product
        start_cheat_caller_address(marketplace.contract_address, PRODUCER);
        let data = array!['testing'].span();
        let price = 10 * ONE_E6; // 10 usdc
        let token_id = marketplace.create_product(10, price, data);

        // Create a consumer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        marketplace.assign_seller_role(CONSUMER);

        // Fund buyer wallet
        let amount_to_buy = 2;
        let total_price_in_stark = marketplace
            .get_product_price(token_id, amount_to_buy, PAYMENT_TOKEN::STRK);
        let minter_address = starknet::contract_address_const::<STRK_TOKEN_MINTER_ADDRESS>();
        let strk_token_address = starknet::contract_address_const::<MainnetConfig::STRK_ADDRESS>();
        let strk_token_dispatcher = IERC20Dispatcher { contract_address: strk_token_address };

        start_cheat_caller_address(strk_token_address, minter_address);
        let mut calldata = array![];
        calldata.append_serde(CONSUMER);
        calldata.append_serde(total_price_in_stark);
        call_contract_syscall(strk_token_address, selector!("permissioned_mint"), calldata.span())
            .unwrap();

        // Approve marketplace to spend buyer's tokens
        start_cheat_caller_address(strk_token_address, CONSUMER);
        strk_token_dispatcher.approve(marketplace.contract_address, total_price_in_stark);

        // Buy a product
        cheat_caller_address(marketplace.contract_address, CONSUMER, CheatSpan::TargetCalls(1));
        stop_cheat_caller_address(strk_token_address);
        stop_cheat_caller_address(cofi_collection.contract_address);
        marketplace.buy_product(token_id, amount_to_buy, PAYMENT_TOKEN::STRK);

        let minted_nfts = cofi_collection.balance_of(CONSUMER, token_id);
        assert(minted_nfts == amount_to_buy, 'invalid minted nfts');

        // Claim the rewards
        let usdc_token_address = starknet::contract_address_const::<MainnetConfig::USDC_ADDRESS>();
        let usdc_token_dispatcher = IERC20Dispatcher { contract_address: usdc_token_address };
        start_cheat_caller_address(usdc_token_address, marketplace.contract_address);
        start_cheat_caller_address(marketplace.contract_address, PRODUCER);
        let producer_usdc_before = usdc_token_dispatcher.balance_of(PRODUCER);

        let claim_balance = marketplace.claim_balance(PRODUCER);
        assert(claim_balance > 0, 'invalid claim balance');

        marketplace.claim();
        let producer_usdc_after = usdc_token_dispatcher.balance_of(PRODUCER);
        assert(producer_usdc_before < producer_usdc_after, 'invalid producer starks');
    }
}
