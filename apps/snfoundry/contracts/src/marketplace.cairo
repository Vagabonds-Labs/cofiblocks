// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^0.18.0

#[starknet::contract]
mod Marketplace {
    // dispatchers
    use contracts::cofi_collection::{ICofiCollectionDispatcher, ICofiCollectionDispatcherTrait};
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc1155::ERC1155HooksEmptyImpl;
    use starknet::storage::Map;
    use starknet::{ContractAddress, get_caller_address, get_contract_address};

    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);

    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    #[abi(embed_v0)]
    impl AccessControlCamelImpl =
        AccessControlComponent::AccessControlCamelImpl<ContractState>;

    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    const COFI_COLLECTION_TOKEN_ID: u8 = 1;

    pub mod Errors {
        pub const NFT_NOT_ON_SALE: felt252 = 'Error: nft not on sale';
        pub const NOT_OWNER: felt252 = 'Error: not owner';
        pub const BUY_SELF_NFT: felt252 = 'Error: buy self nft';
        pub const ALLOWANCE_NOT_SET: felt252 = 'Error: allowance not set';
        pub const INSUFFICIENT_BALANCE: felt252 = 'Error: insufficient balance';
    }

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        pub nfts_owner: Map<u256, ContractAddress>,
        pub nfts_price: Map<u256, u256>,
        pub nfts_status: Map<u256, u8>,
        pub cofi_collection_address: ContractAddress,
        pub current_token_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct NFT_BOUGHT {
        from: ContractAddress,
        to: ContractAddress,
        token_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct NFT_LISTED {
        from: ContractAddress,
        token_id: u256,
        price: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct NFT_CANCELLED {
        token_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct NFT_PRICE_EDITED {
        token_id: u256,
        new_price: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        NFT_BOUGHT: NFT_BOUGHT,
        NFT_LISTED: NFT_LISTED,
        NFT_CANCELLED: NFT_CANCELLED,
        NFT_PRICE_EDITED: NFT_PRICE_EDITED,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        default_admin: ContractAddress,
        cofi_collection_address: ContractAddress,
    ) {
        self.accesscontrol.initializer();
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, default_admin);
        self.cofi_collection_address.write(cofi_collection_address);
        // TOKEN ID 1 is for COFI Fungible token
        self.current_token_id.write(2);
    }

    #[external(v0)]
    fn buy_nft(ref self: ContractState, token_id: u256) {
        // self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
        assert(self.nfts_status.read(token_id) == 1, Errors::NFT_NOT_ON_SALE);

        let nft_owner = self.nfts_owner.read(token_id);
        assert(nft_owner != get_caller_address(), Errors::BUY_SELF_NFT);
        assert(
            ICofiCollectionDispatcher { contract_address: self.cofi_collection_address.read() }
                .is_approved_for_all(get_caller_address(), get_contract_address()),
            Errors::ALLOWANCE_NOT_SET
        );

        let nft_price = self.nfts_price.read(token_id);
        assert(
            ICofiCollectionDispatcher { contract_address: self.cofi_collection_address.read() }
                .balance_of(get_caller_address(), COFI_COLLECTION_TOKEN_ID.into()) >= nft_price,
            Errors::INSUFFICIENT_BALANCE
        );

        let data = array![];
        ICofiCollectionDispatcher { contract_address: self.cofi_collection_address.read() }
            .safe_transfer_from(
                get_caller_address(),
                nft_owner,
                COFI_COLLECTION_TOKEN_ID.into(),
                nft_price,
                data.span()
            );

        ICofiCollectionDispatcher { contract_address: self.cofi_collection_address.read() }
            .safe_transfer_from(nft_owner, get_caller_address(), token_id, 1, data.span());

        self.nfts_status.write(token_id, 0);
        self.emit(NFT_BOUGHT { from: nft_owner, to: get_caller_address(), token_id: token_id });
        self.nfts_owner.write(token_id, get_caller_address());
    }

    #[external(v0)]
    fn listing_nft(ref self: ContractState, data: felt252, uri: ByteArray, price: u256) {
        assert(
            ICofiCollectionDispatcher { contract_address: self.cofi_collection_address.read() }
                .is_approved_for_all(get_caller_address(), get_contract_address()),
            Errors::ALLOWANCE_NOT_SET
        );

        let data_array = array![data];
        let token_id = self.current_token_id.read();
        ICofiCollectionDispatcher { contract_address: self.cofi_collection_address.read() }
            .mint_item(get_caller_address(), token_id, 1, data_array.span(), uri);

        self.nfts_owner.write(token_id, get_caller_address());
        self.nfts_price.write(token_id, price);
        self.nfts_status.write(token_id, 1);

        self.current_token_id.write(token_id + 1);

        self.emit(NFT_LISTED { from: get_caller_address(), token_id: token_id, price: price });
    }

    #[external(v0)]
    fn cancel_listing(ref self: ContractState, token_id: u256) {
        assert(self.nfts_status.read(token_id) == 1, Errors::NFT_NOT_ON_SALE);
        assert(self.nfts_owner.read(token_id) == get_caller_address(), Errors::NOT_OWNER);

        self.nfts_status.write(token_id, 0);

        self.emit(NFT_CANCELLED { token_id: token_id });
    }

    #[external(v0)]
    fn get_nft_price(self: @ContractState, token_id: u256) -> u256 {
        self.nfts_price.read(token_id)
    }

    #[external(v0)]
    fn get_nft_owner(self: @ContractState, token_id: u256) -> ContractAddress {
        self.nfts_owner.read(token_id)
    }

    #[external(v0)]
    fn edit_nft_price(ref self: ContractState, token_id: u256, price: u256) {
        assert(self.nfts_status.read(token_id) == 1, Errors::NFT_NOT_ON_SALE);
        assert(self.nfts_owner.read(token_id) == get_caller_address(), Errors::NOT_OWNER);

        self.nfts_price.write(token_id, price);
        self.emit(NFT_PRICE_EDITED { token_id: token_id, new_price: price });
    }
}
