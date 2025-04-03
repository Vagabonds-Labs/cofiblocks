mod test_marketplace {
    use contracts::cofi_collection::ICofiCollectionDispatcher;
    use contracts::cofi_collection::ICofiCollectionDispatcherTrait;
    use contracts::marketplace::{
        IMarketplaceDispatcher, IMarketplaceDispatcherTrait, PAYMENT_TOKEN
    };
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    use openzeppelin::utils::serde::SerializedAppend;
    use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address};
    use starknet::ContractAddress;
    use starknet::syscalls::call_contract_syscall;

    fn OWNER() -> ContractAddress {
        starknet::contract_address_const::<'OWNER'>()
    }

    const STRK_TOKEN_ADDRESS: felt252 =
        0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;

    const STRK_TOKEN_MINTER_ADDRESS: felt252 =
        0x0594c1582459ea03f77deaf9eb7e3917d6994a03c13405ba42867f83d85f085d;

    const ONE_E18: u256 = 1000000000000000000_u256;
    const MARKET_FEE: u256 = 250_u256; // 2.5%

    const EKUBO_ADDRESS_MAINNET: felt252 =
        0x00000005dd3D2F4429AF886cD1a3b08289DBcEa99A294197E9eB43b0e0325b4b;

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
        calldata.append_serde(EKUBO_ADDRESS_MAINNET); // ekubo
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
    fn test_buy_product() {
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
        let price = 1 * ONE_E18; // 1 stark
        let token_id = marketplace.create_product(10, price, data);

        // Create a consumer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        marketplace.assign_seller_role(CONSUMER);

        // Fund buyer wallet
        let amount_to_buy = 2;
        let required_tokens = calculate_total_token_price(price, amount_to_buy);
        let minter_address = starknet::contract_address_const::<STRK_TOKEN_MINTER_ADDRESS>();
        let token_address = starknet::contract_address_const::<STRK_TOKEN_ADDRESS>();
        let token_dispatcher = IERC20Dispatcher { contract_address: token_address };

        start_cheat_caller_address(token_address, minter_address);
        let mut calldata = array![];
        calldata.append_serde(CONSUMER);
        calldata.append_serde(required_tokens);
        call_contract_syscall(token_address, selector!("permissioned_mint"), calldata.span())
            .unwrap();

        assert(token_dispatcher.balance_of(CONSUMER) == required_tokens, 'invalid balance');

        // Approve marketplace to spend buyer's tokens
        start_cheat_caller_address(token_address, CONSUMER);
        token_dispatcher.approve(marketplace.contract_address, required_tokens);

        // Buy a product
        start_cheat_caller_address(marketplace.contract_address, CONSUMER);
        start_cheat_caller_address(token_address, marketplace.contract_address);
        start_cheat_caller_address(cofi_collection.contract_address, marketplace.contract_address);
        marketplace.buy_product(token_id, amount_to_buy, PAYMENT_TOKEN::STRK);

        let minted_nfts = cofi_collection.balance_of(CONSUMER, token_id);
        assert(minted_nfts == amount_to_buy, 'invalid minted nfts');
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
        let price = array![100001, 100002].span();
        let token_ids = marketplace.create_products(initial_stock, price);

        // Create a consumer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        marketplace.assign_seller_role(CONSUMER);

        // Fund buyer wallet
        let minter_address = starknet::contract_address_const::<STRK_TOKEN_MINTER_ADDRESS>();
        let token_address = starknet::contract_address_const::<STRK_TOKEN_ADDRESS>();
        let token_dispatcher = IERC20Dispatcher { contract_address: token_address };

        start_cheat_caller_address(token_address, minter_address);
        let mut calldata = array![];
        calldata.append_serde(CONSUMER);
        calldata.append_serde(50000000_u256);
        call_contract_syscall(token_address, selector!("permissioned_mint"), calldata.span())
            .unwrap();

        assert(token_dispatcher.balance_of(CONSUMER) == 50000000_u256, 'invalid balance');

        // Approve marketplace to spend buyer's tokens
        start_cheat_caller_address(token_address, CONSUMER);
        token_dispatcher.approve(marketplace.contract_address, 50000000_u256);

        // Buy a product
        start_cheat_caller_address(marketplace.contract_address, CONSUMER);
        start_cheat_caller_address(token_address, marketplace.contract_address);
        start_cheat_caller_address(cofi_collection.contract_address, marketplace.contract_address);
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
        let price = 1 * ONE_E18; // 1 stark
        let token_id = marketplace.create_product(10, price, data);

        // Create a consumer
        start_cheat_caller_address(marketplace.contract_address, OWNER());
        marketplace.assign_seller_role(CONSUMER);

        // Fund buyer wallet
        let amount_to_buy = 2;
        let required_tokens = calculate_total_token_price(price, amount_to_buy);
        let minter_address = starknet::contract_address_const::<STRK_TOKEN_MINTER_ADDRESS>();
        let token_address = starknet::contract_address_const::<STRK_TOKEN_ADDRESS>();
        let token_dispatcher = IERC20Dispatcher { contract_address: token_address };

        start_cheat_caller_address(token_address, minter_address);
        let mut calldata = array![];
        calldata.append_serde(CONSUMER);
        calldata.append_serde(required_tokens);
        call_contract_syscall(token_address, selector!("permissioned_mint"), calldata.span())
            .unwrap();

        // Approve marketplace to spend buyer's tokens
        start_cheat_caller_address(token_address, CONSUMER);
        token_dispatcher.approve(marketplace.contract_address, required_tokens);

        // Buy a product
        start_cheat_caller_address(marketplace.contract_address, CONSUMER);
        start_cheat_caller_address(token_address, marketplace.contract_address);
        start_cheat_caller_address(cofi_collection.contract_address, marketplace.contract_address);
        marketplace.buy_product(token_id, amount_to_buy, PAYMENT_TOKEN::STRK);

        let minted_nfts = cofi_collection.balance_of(CONSUMER, token_id);
        assert(minted_nfts == amount_to_buy, 'invalid minted nfts');

        // Claim the rewards
        start_cheat_caller_address(token_address, marketplace.contract_address);
        start_cheat_caller_address(marketplace.contract_address, PRODUCER);
        let producer_starks_before = token_dispatcher.balance_of(PRODUCER);

        let claim_balance = marketplace.claim_balance(PRODUCER);
        assert(claim_balance > 0, 'invalid claim balance');

        marketplace.claim();
        let producer_starks_after = token_dispatcher.balance_of(PRODUCER);
        assert(producer_starks_before < producer_starks_after, 'invalid producer starks');
    }
}

