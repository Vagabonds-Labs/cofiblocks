// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^0.15.0

#[starknet::contract]
mod Receiver {
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc1155::ERC1155ReceiverComponent;

    component!(
        path: ERC1155ReceiverComponent, storage: erc1155_receiver, event: ERC1155ReceiverEvent,
    );
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // ERC1155Receiver
    #[abi(embed_v0)]
    impl ERC1155ReceiverImpl =
        ERC1155ReceiverComponent::ERC1155ReceiverImpl<ContractState>;
    impl ERC1155ReceiverInternalImpl = ERC1155ReceiverComponent::InternalImpl<ContractState>;

    // SRC5
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc1155_receiver: ERC1155ReceiverComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC1155ReceiverEvent: ERC1155ReceiverComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.erc1155_receiver.initializer();
    }
}
