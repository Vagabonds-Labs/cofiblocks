mod test_distribution {
    use contracts::distribution::{IDistributionDispatcher, IDistributionDispatcherTrait};
    use openzeppelin::utils::serde::SerializedAppend;
    use snforge_std::{
        CheatSpan, ContractClassTrait, DeclareResultTrait, cheat_caller_address, declare, load,
    };
    use starknet::ContractAddress;

    const ONE_E6: u256 = 1_000_000;

    fn COFOUNDER1() -> ContractAddress {
        'COFOUNDER1'.try_into().unwrap()
    }

    fn COFOUNDER2() -> ContractAddress {
        'COFOUNDER2'.try_into().unwrap()
    }

    fn OWNER() -> ContractAddress {
        'OWNER'.try_into().unwrap()
    }

    fn MARKETPLACE() -> ContractAddress {
        'MARKETPLACE'.try_into().unwrap()
    }

    fn calculate_profit(amount: u256) -> u256 {
        let market_fee = 500; // 5%
        (amount * market_fee) / 10_000
    }

    fn deploy_receiver() -> ContractAddress {
        let contract = declare("Receiver").unwrap().contract_class();
        let calldata = array![];
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        contract_address
    }

    fn deploy_distribution() -> IDistributionDispatcher {
        let contract = declare("Distribution").unwrap().contract_class();

        let mut calldata: Array<felt252> = array![];
        calldata.append_serde(OWNER()); // admin

        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        let distribution = IDistributionDispatcher { contract_address };

        cheat_caller_address(distribution.contract_address, OWNER(), CheatSpan::TargetCalls(1));
        distribution.set_marketplace(MARKETPLACE());

        distribution
    }

    #[test]
    fn test_register_purchase() {
        let distribution = deploy_distribution();

        let producer = 'PRODUCER'.try_into().unwrap();

        // Make two purchases
        cheat_caller_address(
            distribution.contract_address, MARKETPLACE(), CheatSpan::TargetCalls(2),
        );
        let buyer1 = 'BUYER1'.try_into().unwrap();
        let product_price1 = 50 * ONE_E6;
        let profit1 = calculate_profit(product_price1);
        distribution.register_purchase(buyer1, producer, true, product_price1, profit1);

        let buyer2 = 'BUYER2'.try_into().unwrap();
        let product_price2 = 100 * ONE_E6;
        let profit2 = calculate_profit(product_price2);
        distribution.register_purchase(buyer2, producer, true, product_price2, profit2);

        // Check total profit, total purchases, and balances
        let total_profit = load(distribution.contract_address, selector!("total_profit"), 1);
        let expected_profit = profit1 + profit2;
        let found_profit = *total_profit.at(0);
        assert(found_profit.into() == expected_profit, 'Wrong Total profit');

        let total_purchases = load(distribution.contract_address, selector!("total_purchases"), 1);
        let expected_purchases = product_price1 + profit1 + product_price2 + profit2;
        let found_purchases = *total_purchases.at(0);
        assert(found_purchases.into() == expected_purchases, 'Wrong Total purchases');

        let coffee_lovers = load(distribution.contract_address, selector!("coffee_lovers"), 1);
        // Checking the length of coffee_lovers
        assert(*coffee_lovers.at(0) == 2, 'Wrong cl length');
    }

    #[test]
    fn test_distribute_buyers() {
        let distribution = deploy_distribution();

        let producer = 'PRODUCER'.try_into().unwrap();

        // Make two purchases
        cheat_caller_address(
            distribution.contract_address, MARKETPLACE(), CheatSpan::TargetCalls(2),
        );
        let buyer1 = 'BUYER1'.try_into().unwrap();
        let product_price1 = 1000 * ONE_E6;
        let profit1 = calculate_profit(product_price1);
        distribution.register_purchase(buyer1, producer, true, product_price1, profit1);

        let buyer2 = 'BUYER2'.try_into().unwrap();
        let product_price2 = 2000 * ONE_E6;
        let profit2 = calculate_profit(product_price2);
        distribution.register_purchase(buyer2, producer, true, product_price2, profit2);

        // Distribute profits
        cheat_caller_address(distribution.contract_address, OWNER(), CheatSpan::TargetCalls(2));
        distribution.distribute();

        // Check claims for buyers
        let total_profit = profit1 + profit2;
        let total_purchases = product_price1 + product_price2 + total_profit;
        let cl_profits = (total_profit * 30 * 100) / 10_000; // 30% of total profit

        // Check for buyer1
        let buyer1_percentage = (product_price1 + profit1) * 100 / total_purchases;
        let expected_buyer1_claim = (cl_profits * buyer1_percentage * 100) / 10_000;
        let buyer1_claim = distribution.coffee_lover_claim_balance(buyer1);
        assert(buyer1_claim == expected_buyer1_claim, 'Wrong Buyer1 claim');

        // Check for buyer2
        let buyer2_percentage = (product_price2 + profit2) * 100 / total_purchases;
        let expected_buyer2_claim = (cl_profits * buyer2_percentage * 100) / 10_000;
        let buyer2_claim = distribution.coffee_lover_claim_balance(buyer2);
        assert(buyer2_claim == expected_buyer2_claim, 'Wrong Buyer2 claim');

        // Finally check that total profit and purchases are reset
        let total_profit_after = load(distribution.contract_address, selector!("total_profit"), 1);
        assert(*total_profit_after.at(0) == 0, 'Total profit not reset');

        let total_purchases_after = load(
            distribution.contract_address, selector!("total_purchases"), 1,
        );
        assert(*total_purchases_after.at(0) == 0, 'Total purchases not reset');

        let coffee_lovers = load(distribution.contract_address, selector!("coffee_lovers"), 1);
        // Check that coffee_lovers list is empty after distribution
        assert(*coffee_lovers.at(0) == 0, 'Coffee lovers not reset');
    }

    #[test]
    fn test_distribute_producers() {
        let distribution = deploy_distribution();

        let producer1 = 'PRODUCER1'.try_into().unwrap();
        let producer2 = 'PRODUCER2'.try_into().unwrap();

        // Make two purchases
        cheat_caller_address(
            distribution.contract_address, MARKETPLACE(), CheatSpan::TargetCalls(2),
        );
        let buyer1 = 'BUYER1'.try_into().unwrap();
        let product_price1 = 1000 * ONE_E6;
        let profit1 = calculate_profit(product_price1);
        distribution.register_purchase(buyer1, producer1, true, product_price1, profit1);

        let buyer2 = 'BUYER2'.try_into().unwrap();
        let product_price2 = 2000 * ONE_E6;
        let profit2 = calculate_profit(product_price2);
        distribution.register_purchase(buyer2, producer2, true, product_price2, profit2);

        // Distribute profits
        cheat_caller_address(distribution.contract_address, OWNER(), CheatSpan::TargetCalls(2));
        distribution.distribute();

        // Check claims for producers
        let total_profit = profit1 + profit2;
        let total_purchases = product_price1 + product_price2 + total_profit;
        let producer_profits = (total_profit * 30 * 100) / 10_000; // 30% of total profit

        // Check for producer1
        let producer1_percentage = (product_price1 + profit1) * 100 / total_purchases;
        let expected_producer1_claim = (producer_profits * producer1_percentage * 100) / 10_000;
        let producer1_claim = distribution.producer_claim_balance(producer1);
        assert(producer1_claim == expected_producer1_claim, 'Wrong Producer1 claim');

        // Check for producer2
        let producer2_percentage = (product_price2 + profit2) * 100 / total_purchases;
        let expected_producer2_claim = (producer_profits * producer2_percentage * 100) / 10_000;
        let producer2_claim = distribution.producer_claim_balance(producer2);
        assert(producer2_claim == expected_producer2_claim, 'Wrong Producer2 claim');

        // Finally check that producers are clean
        let producers = load(distribution.contract_address, selector!("producers"), 1);
        // Check that producers list is empty after distribution
        assert(*producers.at(0) == 0, 'Producers not reset');
    }

    #[test]
    fn test_distribute_roasters() {
        let distribution = deploy_distribution();

        let roaster1 = 'ROASTER1'.try_into().unwrap();
        let roaster2 = 'ROASTER2'.try_into().unwrap();

        // Make two purchases
        cheat_caller_address(
            distribution.contract_address, MARKETPLACE(), CheatSpan::TargetCalls(2),
        );
        let buyer1 = 'BUYER1'.try_into().unwrap();
        let product_price1 = 1000 * ONE_E6;
        let profit1 = calculate_profit(product_price1);
        distribution.register_purchase(buyer1, roaster1, false, product_price1, profit1);

        let buyer2 = 'BUYER2'.try_into().unwrap();
        let product_price2 = 2000 * ONE_E6;
        let profit2 = calculate_profit(product_price2);
        distribution.register_purchase(buyer2, roaster2, false, product_price2, profit2);

        // Distribute profits
        cheat_caller_address(distribution.contract_address, OWNER(), CheatSpan::TargetCalls(2));
        distribution.distribute();

        // Check claims for roasters
        let total_profit = profit1 + profit2;
        let total_purchases = product_price1 + product_price2 + total_profit;
        let roaster_profits = (total_profit * 5 * 100) / 10_000; // 5% of total profit

        // Check for roaster1
        let roaster1_percentage = (product_price1 + profit1) * 100 / total_purchases;
        let expected_roaster1_claim = (roaster_profits * roaster1_percentage * 100) / 10_000;
        let roaster1_claim = distribution.roaster_claim_balance(roaster1);
        assert(roaster1_claim == expected_roaster1_claim, 'Wrong Roaster1 claim');

        // Check for roaster2
        let roaster2_percentage = (product_price2 + profit2) * 100 / total_purchases;
        let expected_roaster2_claim = (roaster_profits * roaster2_percentage * 100) / 10_000;
        let roaster2_claim = distribution.roaster_claim_balance(roaster2);
        assert(roaster2_claim == expected_roaster2_claim, 'Wrong Roaster2 claim');

        // Finally check that roasters are clean
        let roasters = load(distribution.contract_address, selector!("roasters"), 1);
        // Check that roasters list is empty after distribution
        assert(*roasters.at(0) == 0, 'Roasters not reset');
    }

    #[test]
    fn test_distribute_cambiatus() {
        let distribution = deploy_distribution();

        let producer = 'PRODUCER'.try_into().unwrap();

        // Make two purchases
        cheat_caller_address(
            distribution.contract_address, MARKETPLACE(), CheatSpan::TargetCalls(2),
        );
        let buyer1 = 'BUYER1'.try_into().unwrap();
        let product_price1 = 1000 * ONE_E6;
        let profit1 = calculate_profit(product_price1);
        distribution.register_purchase(buyer1, producer, true, product_price1, profit1);

        let buyer2 = 'BUYER2'.try_into().unwrap();
        let product_price2 = 2000 * ONE_E6;
        let profit2 = calculate_profit(product_price2);
        distribution.register_purchase(buyer2, producer, true, product_price2, profit2);

        // Distribute profits
        cheat_caller_address(distribution.contract_address, OWNER(), CheatSpan::TargetCalls(2));
        distribution.distribute();

        // Check claims for cambiatus
        let total_profit = profit1 + profit2;
        let cambiatus_profits = (total_profit * 2 * 100) / 10_000; // 2% of total profit
        let cambiatus_claim = distribution.cambiatus_claim_balance();
        assert(cambiatus_claim == cambiatus_profits, 'Cambiatus claim is wrong');
    }

    #[test]
    fn test_distribute_cofiblocks() {
        let distribution = deploy_distribution();

        let producer = 'PRODUCER'.try_into().unwrap();

        // Make two purchases
        cheat_caller_address(
            distribution.contract_address, MARKETPLACE(), CheatSpan::TargetCalls(2),
        );
        let buyer1 = 'BUYER1'.try_into().unwrap();
        let product_price1 = 1000 * ONE_E6;
        let profit1 = calculate_profit(product_price1);
        distribution.register_purchase(buyer1, producer, true, product_price1, profit1);

        let buyer2 = 'BUYER2'.try_into().unwrap();
        let product_price2 = 2000 * ONE_E6;
        let profit2 = calculate_profit(product_price2);
        distribution.register_purchase(buyer2, producer, true, product_price2, profit2);

        // Distribute profits
        cheat_caller_address(distribution.contract_address, OWNER(), CheatSpan::TargetCalls(2));
        distribution.distribute();

        // Check claims for cofiblocks
        let total_profit = profit1 + profit2;
        let cofi_profits = (total_profit * 24 * 100) / 10_000; // 24% of total profit
        let cofi_claim = distribution.cofiblocks_claim_balance();
        assert(cofi_profits == cofi_claim, 'Cofiblocks claim is wrong');
    }

    #[test]
    fn test_distribute_cofounders() {
        let distribution = deploy_distribution();

        let producer = 'PRODUCER'.try_into().unwrap();

        // Add cofounders
        cheat_caller_address(
            distribution.contract_address, MARKETPLACE(), CheatSpan::TargetCalls(4),
        );
        distribution.add_cofounder(COFOUNDER1());
        distribution.add_cofounder(COFOUNDER2());

        // Make two purchases
        let buyer1 = 'BUYER1'.try_into().unwrap();
        let product_price1 = 1000 * ONE_E6;
        let profit1 = calculate_profit(product_price1);
        distribution.register_purchase(buyer1, producer, true, product_price1, profit1);

        let buyer2 = 'BUYER2'.try_into().unwrap();
        let product_price2 = 2000 * ONE_E6;
        let profit2 = calculate_profit(product_price2);
        distribution.register_purchase(buyer2, producer, true, product_price2, profit2);

        // Distribute profits
        cheat_caller_address(distribution.contract_address, OWNER(), CheatSpan::TargetCalls(2));
        distribution.distribute();

        // Check claims for cofounders
        let total_profit = profit1 + profit2;
        let cofounder_profits = (total_profit * 9 * 100) / 10_000; // 9% of total profit
        let cofounder_percentage = 100 / 2; // 50% for each cofounder
        let expected_cofounder_claim = (cofounder_profits * cofounder_percentage * 100) / 10_000;

        // Check for cofounder1
        let cofounder1_claim = distribution.cofounder_claim_balance(COFOUNDER1());
        assert(cofounder1_claim == expected_cofounder_claim, 'Wrong Cofounder1 claim');

        // Check for cofounder1
        let cofounder2_claim = distribution.cofounder_claim_balance(COFOUNDER2());
        assert(cofounder2_claim == expected_cofounder_claim, 'Wrong Cofounder2 claim');
    }

    #[test]
    fn test_roaster_producer_relation() {
        let distribution = deploy_distribution();

        let roaster1 = 'ROASTER1'.try_into().unwrap();
        let producer1 = 'PRODUCER1'.try_into().unwrap();

        // Register roaster and producer
        cheat_caller_address(distribution.contract_address, OWNER(), CheatSpan::TargetCalls(1));
        distribution.set_roaster_producer(roaster1, producer1);

        // Make two purchases
        cheat_caller_address(
            distribution.contract_address, MARKETPLACE(), CheatSpan::TargetCalls(2),
        );
        let buyer1 = 'BUYER1'.try_into().unwrap();
        let product_price1 = 1000 * ONE_E6;
        let profit1 = calculate_profit(product_price1);
        distribution.register_purchase(buyer1, roaster1, false, product_price1, profit1);

        let buyer2 = 'BUYER2'.try_into().unwrap();
        let product_price2 = 2000 * ONE_E6;
        let profit2 = calculate_profit(product_price2);
        distribution.register_purchase(buyer2, roaster1, false, product_price2, profit2);

        // Distribute profits
        cheat_caller_address(distribution.contract_address, OWNER(), CheatSpan::TargetCalls(2));
        distribution.distribute();

        // Check claims for roasters
        let total_profit = profit1 + profit2;
        let total_purchases = product_price1 + product_price2 + total_profit;
        let roaster_profits = (total_profit * 5 * 100) / 10_000; // 5% of total profit

        // Check for roaster1
        let roaster1_percentage = 100; // only one roaster
        let expected_roaster1_claim = (roaster_profits * roaster1_percentage * 100) / 10_000;
        let roaster1_claim = distribution.roaster_claim_balance(roaster1);
        assert(roaster1_claim == expected_roaster1_claim, 'Wrong Roaster1 claim');

        // Check for producer1
        let producer_profits = (total_profit * 30 * 100) / 10_000; // 30% of total profit
        let producer_percentage = 100; // only one producer
        let expected_producer_claim = (producer_profits * producer_percentage * 100) / 10_000;
        let producer_claim = distribution.producer_claim_balance(producer1);
        assert(producer_claim == expected_producer_claim, 'Wrong producer1 claim');
    }
}
