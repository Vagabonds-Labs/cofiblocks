use starknet::ContractAddress;

#[starknet::interface]
pub trait IDistribution<TContractState> {
    fn set_marketplace(ref self: TContractState, marketplace: ContractAddress);
    fn register_purchase(
        ref self: TContractState, address: ContractAddress, amount: u256, profit: u256,
    );
    fn coffee_lover_claim_balance(ref self: TContractState, address: ContractAddress) -> u256;
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
        purchase_per_cl: Map<ContractAddress, u256>,
        coffee_lovers: Vec<ContractAddress>,
        cl_claim_balances: Map<ContractAddress, u256>,
        total_purchases: u256,
        total_profit: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, admin: ContractAddress, marketplace: ContractAddress) {
        self.erc1155_receiver.initializer();
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, admin);

        self.marketplace_address.write(marketplace);
    }

    #[abi(embed_v0)]
    impl DistributionImpl of super::IDistribution<ContractState> {
        fn set_marketplace(ref self: ContractState, marketplace: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(MARKETPLACE_ROLE, marketplace);
        }

        fn register_purchase(
            ref self: ContractState, address: ContractAddress, amount: u256, profit: u256,
        ) {
            self.accesscontrol.assert_only_role(MARKETPLACE_ROLE);
            let current_amount = self.purchase_per_cl.read(address);
            if current_amount == 0 {
                self.coffee_lovers.push(address);
            }
            self.purchase_per_cl.write(address, current_amount + amount);
            self.total_purchases.write(self.total_purchases.read() + amount);
            self.total_profit.write(self.total_profit.read() + profit);
        }

        fn coffee_lover_claim_balance(ref self: ContractState, address: ContractAddress) -> u256 {
            self.cl_claim_balances.read(address)
        }

        fn distribute(ref self: ContractState) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);

            self.distribute_coffee_lover_profits();

            // Reset the state
            self.total_purchases.write(0);
            self.total_profit.write(0);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn get_coffee_lover_claim_balance(
            ref self: ContractState, address: ContractAddress,
        ) -> u256 {
            let total_purchases = self.total_purchases.read();
            let coffee_lover_purchases = self.purchase_per_cl.read(address);
            let coffee_lover_percentage = coffee_lover_purchases / total_purchases;
            // Check this
            let cl_profits = self.total_profit.read() * 3000;
            cl_profits * coffee_lover_percentage
        }

        fn distribute_coffee_lover_profits(ref self: ContractState) {
            let mut i = 0;
            let len = self.coffee_lovers.len();
            loop {
                if i == len {
                    break;
                }
                let cl_address = self.coffee_lovers.pop().unwrap();
                let cl_balance = self.get_coffee_lover_claim_balance(cl_address);
                self
                    .cl_claim_balances
                    .write(cl_address, self.cl_claim_balances.read(cl_address) + cl_balance);

                // Clean
                self.purchase_per_cl.write(cl_address, 0);
                i += 1;
            }
        }
    }
}
