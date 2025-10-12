use starknet::ContractAddress;

#[starknet::interface]
pub trait IDistribution<TContractState> {
    fn set_marketplace(ref self: TContractState, marketplace: ContractAddress);
    fn set_roaster_producer(
        ref self: TContractState,
        roaster_address: ContractAddress,
        producer_address: ContractAddress,
    );
    fn register_purchase(
        ref self: TContractState,
        buyer_address: ContractAddress,
        product_owner_address: ContractAddress,
        is_producer: bool,
        product_price: u256,
        profit: u256,
    );
    fn coffee_lover_claim_balance(self: @TContractState, address: ContractAddress) -> u256;
    fn coffee_lover_claim_reset(ref self: TContractState, address: ContractAddress);
    fn producer_claim_balance(self: @TContractState, address: ContractAddress) -> u256;
    fn producer_claim_reset(ref self: TContractState, address: ContractAddress);
    fn roaster_claim_balance(self: @TContractState, address: ContractAddress) -> u256;
    fn roaster_claim_reset(ref self: TContractState, address: ContractAddress);
    fn cambiatus_claim_balance(self: @TContractState) -> u256;
    fn cambiatus_claim_reset(ref self: TContractState);
    fn cofiblocks_claim_balance(self: @TContractState) -> u256;
    fn cofiblocks_claim_reset(ref self: TContractState);
    fn cofounder_claim_balance(self: @TContractState, address: ContractAddress) -> u256;
    fn cofounder_claim_reset(ref self: TContractState, address: ContractAddress);
    fn add_cofounder(ref self: TContractState, address: ContractAddress);
    fn distribute(ref self: TContractState);
}

#[starknet::contract]
mod Distribution {
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc1155::erc1155_receiver::ERC1155ReceiverComponent;
    use openzeppelin::upgrades::UpgradeableComponent;
    use starknet::ContractAddress;
    use starknet::storage::{
        Map, MutableVecTrait, StoragePointerReadAccess, StoragePointerWriteAccess, Vec,
    };

    component!(
        path: ERC1155ReceiverComponent, storage: erc1155_receiver, event: ERC1155ReceiverEvent,
    );
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

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

    const MARKETPLACE_ROLE: felt252 = selector!("MARKETPLACE_ROLE");

    // Percentages of profit distribution
    const COFFEE_LOVER_PROFIT_PERCENTAGE: u256 = 30; // 30%
    const PRODUCER_PROFIT_PERCENTAGE: u256 = 30; // 30%
    const ROASTER_PROFIT_PERCENTAGE: u256 = 5; // 5%
    const CAMBIATUS_PROFIT_PERCENTAGE: u256 = 2; // 2%
    const COFIBLOCKS_PROFIT_PERCENTAGE: u256 = 24; // 24%
    const COFOUNDER_PROFIT_PERCENTAGE: u256 = 9; // 9%

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
        marketplace_address: ContractAddress,
        cambiatus_claim_balance: u256,
        cofiblocks_claim_balance: u256,
        cofounders_addresses: Vec<ContractAddress>,
        cofounders_claim_balances: Map<ContractAddress, u256>,
        purchase_per_cl: Map<ContractAddress, u256>,
        coffee_lovers: Vec<ContractAddress>,
        cl_claim_balances: Map<ContractAddress, u256>,
        producers: Vec<ContractAddress>,
        purchase_per_producer: Map<ContractAddress, u256>,
        producer_claim_balances: Map<ContractAddress, u256>,
        roasters: Vec<ContractAddress>,
        roasters_producers: Map<ContractAddress, ContractAddress>,
        purchase_per_roaster: Map<ContractAddress, u256>,
        roaster_claim_balances: Map<ContractAddress, u256>,
        total_purchases: u256,
        total_profit: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, admin: ContractAddress) {
        self.erc1155_receiver.initializer();
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, admin);
    }

    #[abi(embed_v0)]
    impl DistributionImpl of super::IDistribution<ContractState> {
        fn set_marketplace(ref self: ContractState, marketplace: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(MARKETPLACE_ROLE, marketplace);
        }

        fn set_roaster_producer(
            ref self: ContractState,
            roaster_address: ContractAddress,
            producer_address: ContractAddress,
        ) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.roasters_producers.write(roaster_address, producer_address);
        }

        fn add_cofounder(ref self: ContractState, address: ContractAddress) {
            self.accesscontrol.assert_only_role(MARKETPLACE_ROLE);
            let mut i = 0;
            let len = self.cofounders_addresses.len();
            let mut found = false;
            loop {
                if i == len {
                    break;
                }
                if self.cofounders_addresses.at(i).read() == address {
                    found = true;
                    break;
                }
                i += 1;
            }
            if !found {
                self.cofounders_addresses.push(address);
            }
        }

        fn register_purchase(
            ref self: ContractState,
            buyer_address: ContractAddress,
            product_owner_address: ContractAddress,
            is_producer: bool,
            product_price: u256,
            profit: u256,
        ) {
            self.accesscontrol.assert_only_role(MARKETPLACE_ROLE);

            // Register Coffee lover
            let current_amount = self.purchase_per_cl.read(buyer_address);
            if current_amount == 0 {
                self.coffee_lovers.push(buyer_address);
            }
            let amount = product_price + profit;
            self.purchase_per_cl.write(buyer_address, current_amount + amount);

            if is_producer {
                // Register producer
                let current_producer_amount = self
                    .purchase_per_producer
                    .read(product_owner_address);

                if current_producer_amount == 0 {
                    self.producers.push(product_owner_address);
                }
                self
                    .purchase_per_producer
                    .write(product_owner_address, current_producer_amount + amount);
            } else {
                // Register roaster
                let current_roaster_amount = self.purchase_per_roaster.read(product_owner_address);
                if current_roaster_amount == 0 {
                    self.roasters.push(product_owner_address);
                }
                self
                    .purchase_per_roaster
                    .write(product_owner_address, current_roaster_amount + amount);

                // Register roaster-producer relationship
                let producer_address = self.roasters_producers.read(product_owner_address);
                if producer_address != 0x00.try_into().unwrap() {
                    let current_producer_amount = self.purchase_per_producer.read(producer_address);

                    if current_producer_amount == 0 {
                        self.producers.push(producer_address);
                    }
                    self
                        .purchase_per_producer
                        .write(producer_address, current_producer_amount + amount);
                }
            }
            self.total_purchases.write(self.total_purchases.read() + amount);
            self.total_profit.write(self.total_profit.read() + profit);
        }

        fn coffee_lover_claim_balance(self: @ContractState, address: ContractAddress) -> u256 {
            self.cl_claim_balances.read(address)
        }

        fn coffee_lover_claim_reset(ref self: ContractState, address: ContractAddress) {
            self.accesscontrol.assert_only_role(MARKETPLACE_ROLE);
            self.cl_claim_balances.write(address, 0);
        }

        fn producer_claim_balance(self: @ContractState, address: ContractAddress) -> u256 {
            self.producer_claim_balances.read(address)
        }

        fn producer_claim_reset(ref self: ContractState, address: ContractAddress) {
            self.accesscontrol.assert_only_role(MARKETPLACE_ROLE);
            self.producer_claim_balances.write(address, 0);
        }

        fn roaster_claim_balance(self: @ContractState, address: ContractAddress) -> u256 {
            self.roaster_claim_balances.read(address)
        }

        fn roaster_claim_reset(ref self: ContractState, address: ContractAddress) {
            self.accesscontrol.assert_only_role(MARKETPLACE_ROLE);
            self.roaster_claim_balances.write(address, 0);
        }

        fn cambiatus_claim_balance(self: @ContractState) -> u256 {
            self.cambiatus_claim_balance.read()
        }

        fn cambiatus_claim_reset(ref self: ContractState) {
            self.accesscontrol.assert_only_role(MARKETPLACE_ROLE);
            self.cambiatus_claim_balance.write(0);
        }

        fn cofiblocks_claim_balance(self: @ContractState) -> u256 {
            self.cofiblocks_claim_balance.read()
        }

        fn cofiblocks_claim_reset(ref self: ContractState) {
            self.accesscontrol.assert_only_role(MARKETPLACE_ROLE);
            self.cofiblocks_claim_balance.write(0);
        }

        fn cofounder_claim_balance(self: @ContractState, address: ContractAddress) -> u256 {
            self.cofounders_claim_balances.read(address)
        }

        fn cofounder_claim_reset(ref self: ContractState, address: ContractAddress) {
            self.accesscontrol.assert_only_role(MARKETPLACE_ROLE);
            self.cofounders_claim_balances.write(address, 0);
        }

        fn distribute(ref self: ContractState) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);

            self.distribute_coffee_lover_profits();
            self.distribute_producer_profits();
            self.distribute_roaster_profits();
            self.distribute_cambiatus_profits();
            self.distribute_cofiblocks_profits();
            self.distribute_cofounders_profits();

            // Reset the state
            self.total_purchases.write(0);
            self.total_profit.write(0);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn distribute_coffee_lover_profits(ref self: ContractState) {
            let mut i = 0;
            let len = self.coffee_lovers.len();
            let total_purchases = self.total_purchases.read();
            let cl_profits = self
                .percentage_of(self.total_profit.read(), COFFEE_LOVER_PROFIT_PERCENTAGE);
            loop {
                if i == len {
                    break;
                }
                let address = self.coffee_lovers.pop().unwrap();
                let coffee_lover_purchases = self.purchase_per_cl.read(address);
                let coffee_lover_percentage = (coffee_lover_purchases * 100) / total_purchases;
                let cl_balance = self.percentage_of(cl_profits, coffee_lover_percentage);
                self
                    .cl_claim_balances
                    .write(address, self.cl_claim_balances.read(address) + cl_balance);

                // Clean
                self.purchase_per_cl.write(address, 0);
                i += 1;
            }
        }

        fn distribute_producer_profits(ref self: ContractState) {
            let mut i = 0;
            let len = self.producers.len();
            let total_purchases = self.total_purchases.read();
            let producer_profits = self
                .percentage_of(self.total_profit.read(), PRODUCER_PROFIT_PERCENTAGE);
            loop {
                if i == len {
                    break;
                }
                let address = self.producers.pop().unwrap();
                let producer_purchases = self.purchase_per_producer.read(address);
                let producer_percentage = (producer_purchases * 100) / total_purchases;
                let producer_balance = self.percentage_of(producer_profits, producer_percentage);
                self
                    .producer_claim_balances
                    .write(address, self.producer_claim_balances.read(address) + producer_balance);

                // Clean
                self.purchase_per_producer.write(address, 0);
                i += 1;
            }
        }

        fn distribute_roaster_profits(ref self: ContractState) {
            let mut i = 0;
            let len = self.roasters.len();
            let total_purchases = self.total_purchases.read();
            let roaster_profits = self
                .percentage_of(self.total_profit.read(), ROASTER_PROFIT_PERCENTAGE);
            loop {
                if i == len {
                    break;
                }
                let address = self.roasters.pop().unwrap();
                let roaster_purchases = self.purchase_per_roaster.read(address);
                let roaster_percentage = (roaster_purchases * 100) / total_purchases;
                let roaster_balance = self.percentage_of(roaster_profits, roaster_percentage);
                self
                    .roaster_claim_balances
                    .write(address, self.roaster_claim_balances.read(address) + roaster_balance);

                // Clean
                self.purchase_per_roaster.write(address, 0);
                i += 1;
            }
        }

        fn distribute_cambiatus_profits(ref self: ContractState) {
            let cambiatus_profits = self
                .percentage_of(self.total_profit.read(), CAMBIATUS_PROFIT_PERCENTAGE);
            self
                .cambiatus_claim_balance
                .write(self.cambiatus_claim_balance.read() + cambiatus_profits);
        }

        fn distribute_cofiblocks_profits(ref self: ContractState) {
            let cofiblocks_profits = self
                .percentage_of(self.total_profit.read(), COFIBLOCKS_PROFIT_PERCENTAGE);
            self
                .cofiblocks_claim_balance
                .write(self.cofiblocks_claim_balance.read() + cofiblocks_profits);
        }

        fn distribute_cofounders_profits(ref self: ContractState) {
            let cofounder_profits = self
                .percentage_of(self.total_profit.read(), COFOUNDER_PROFIT_PERCENTAGE);
            let mut i = 0;
            let len = self.cofounders_addresses.len();
            loop {
                if i == len {
                    break;
                }
                let address = self.cofounders_addresses.at(i).read();
                let cofounder_balance = self.percentage_of(cofounder_profits, (100 / len).into());
                self
                    .cofounders_claim_balances
                    .write(
                        address, self.cofounders_claim_balances.read(address) + cofounder_balance,
                    );
                i += 1;
            }
        }

        fn percentage_of(ref self: ContractState, value: u256, percentage: u256) -> u256 {
            // Multiply before dividing to preserve precision in integer division
            (value * percentage * 100) / 10_000
        }
    }
}
