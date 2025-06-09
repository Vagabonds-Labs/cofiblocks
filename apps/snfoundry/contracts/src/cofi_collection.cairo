// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^0.17.0

use starknet::ContractAddress;

const PAUSER_ROLE: felt252 = selector!("PAUSER_ROLE");
const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");
const URI_SETTER_ROLE: felt252 = selector!("URI_SETTER_ROLE");
const UPGRADER_ROLE: felt252 = selector!("UPGRADER_ROLE");

/// Interface for the CofiCollection contract, defining ERC1155 and related methods.
#[starknet::interface]
pub trait ICofiCollection<TContractState> {
    /// Returns the balance of the specified `account` for the given `token_id`.
    ///
    /// # Arguments
    /// * `account` - The address of the account to query.
    /// * `token_id` - The ID of the token to query the balance of.
    fn balance_of(ref self: TContractState, account: ContractAddress, token_id: u256) -> u256;

    /// Returns the balances of multiple `accounts` for the respective `token_ids`.
    ///
    /// # Arguments
    /// * `accounts` - A list of addresses to query.
    /// * `token_ids` - A list of token IDs to query the balances of.
    fn balance_of_batch(
        ref self: TContractState, accounts: Span<ContractAddress>, token_ids: Span<u256>,
    ) -> Span<u256>;

    /// Transfers `value` amount of `token_id` from `from` to `to`.
    ///
    /// # Arguments
    /// * `from` - Address of the sender.
    /// * `to` - Address of the recipient.
    /// * `token_id` - The ID of the token to transfer.
    /// * `value` - The amount of tokens to transfer.
    /// * `data` - Additional data to accompany the transfer.
    fn safe_transfer_from(
        ref self: TContractState,
        from: ContractAddress,
        to: ContractAddress,
        token_id: u256,
        value: u256,
        data: Span<felt252>,
    );

    /// Transfers multiple tokens from `from` to `to` in a batch.
    ///
    /// # Arguments
    /// * `from` - Address of the sender.
    /// * `to` - Address of the recipient.
    /// * `token_ids` - A list of token IDs to transfer.
    /// * `values` - A list of corresponding values for each token ID to transfer.
    /// * `data` - Additional data to accompany the batch transfer.
    fn safe_batch_transfer_from(
        ref self: TContractState,
        from: ContractAddress,
        to: ContractAddress,
        token_ids: Span<u256>,
        values: Span<u256>,
        data: Span<felt252>,
    );

    /// Mints `value` amount of `token_id` to `account`.
    ///
    /// # Arguments
    /// * `account` - The address of the recipient.
    /// * `token_id` - The ID of the token to mint.
    /// * `value` - The amount of tokens to mint.
    /// * `data` - Additional data to accompany the minting.
    fn mint(
        ref self: TContractState,
        account: ContractAddress,
        token_id: u256,
        value: u256,
        data: Span<felt252>,
    );

    /// Mints multiple tokens in a batch.
    ///
    /// # Arguments
    /// * `account` - The address of the recipient.
    /// * `token_ids` - A list of token IDs to mint.
    /// * `values` - A list of corresponding values for each token ID to mint.
    /// * `data` - Additional data to accompany the batch minting.
    fn batch_mint(
        ref self: TContractState,
        account: ContractAddress,
        token_ids: Span<u256>,
        values: Span<u256>,
        data: Span<felt252>,
    );

    /// Mints a new token item with a specific URI to a recipient.
    ///
    /// # Arguments
    /// * `recipient` - The address that will receive the minted token.
    /// * `token_id` - The ID of the token to mint.
    /// * `value` - The amount of tokens to mint.
    /// * `data` - Additional data to accompany the minting.
    /// * `uri` - The URI containing metadata for this token.
    fn mint_item(
        ref self: TContractState,
        recipient: ContractAddress,
        token_id: u256,
        value: u256,
        data: Span<felt252>,
        uri: ByteArray,
    );

    /// Burns `value` amount of `token_id` from `account`.
    ///
    /// # Arguments
    /// * `account` - The address of the account whose tokens are being burned.
    /// * `token_id` - The ID of the token to burn.
    /// * `value` - The amount of tokens to burn.
    fn burn(ref self: TContractState, account: ContractAddress, token_id: u256, value: u256);

    /// Burns multiple tokens in a batch.
    ///
    /// # Arguments
    /// * `account` - The address of the account whose tokens are being burned.
    /// * `token_ids` - A list of token IDs to burn.
    /// * `values` - A list of corresponding values for each token ID to burn.
    fn batch_burn(
        ref self: TContractState,
        account: ContractAddress,
        token_ids: Span<u256>,
        values: Span<u256>,
    );

    /// Returns whether `operator` is approved to manage all of `account`'s assets.
    ///
    /// # Arguments
    /// * `account` - The owner of the assets.
    /// * `operator` - The address to check approval for.
    fn is_approved_for_all(
        ref self: TContractState, account: ContractAddress, operator: ContractAddress,
    ) -> bool;

    /// Sets the approval of `operator` to manage all of `account`'s assets.
    ///
    /// # Arguments
    /// * `operator` - The address to approve or revoke approval for.
    /// * `approved` - Whether the operator is approved.
    fn set_approval_for_all(ref self: TContractState, operator: ContractAddress, approved: bool);

    /// Returns whether `account` is approved for the given `token_id`.
    ///
    /// # Arguments
    /// * `token_id` - The ID of the token to check approval for.
    /// * `account` - The address of the account.
    fn get_approval(ref self: TContractState, token_id: u256, account: ContractAddress) -> bool;

    /// Checks if the contract implements an interface identified by `interface_id`.
    ///
    /// # Arguments
    /// * `interface_id` - The interface identifier to check.
    fn supports_interface(ref self: TContractState, interface_id: felt252) -> bool;

    /// Returns the URI for the metadata of `token_id`.
    ///
    /// # Arguments
    /// * `token_id` - The ID of the token.
    fn uri(ref self: TContractState, token_id: u256) -> ByteArray;

    /// Sets the base URI for all token metadata.
    ///
    /// # Arguments
    /// * `base_uri` - The new base URI to set.
    fn set_base_uri(ref self: TContractState, base_uri: ByteArray);

    /// Pauses all token transfers.
    fn pause(ref self: TContractState);

    /// Unpauses all token transfers.
    fn unpause(ref self: TContractState);

    // Update minter after deployment
    fn set_minter(ref self: TContractState, minter: ContractAddress);
}

#[starknet::contract]
mod CofiCollection {
    use openzeppelin::access::accesscontrol::{AccessControlComponent, DEFAULT_ADMIN_ROLE};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::security::pausable::PausableComponent;
    use openzeppelin::token::erc1155::ERC1155Component;
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use starknet::{ClassHash, ContractAddress, get_caller_address};
    use super::{MINTER_ROLE, PAUSER_ROLE, UPGRADER_ROLE, URI_SETTER_ROLE};

    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    #[abi(embed_v0)]
    impl ERC1155MixinImpl = ERC1155Component::ERC1155MixinImpl<ContractState>;
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    #[abi(embed_v0)]
    impl AccessControlCamelImpl =
        AccessControlComponent::AccessControlCamelImpl<ContractState>;

    impl ERC1155InternalImpl = ERC1155Component::InternalImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc1155: ERC1155Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC1155Event: ERC1155Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        PausableEvent: PausableComponent::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        default_admin: ContractAddress,
        pauser: ContractAddress,
        minter: ContractAddress,
        uri_setter: ContractAddress,
        upgrader: ContractAddress,
    ) {
        self.erc1155.initializer("");
        self.accesscontrol.initializer();

        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, default_admin);
        self.accesscontrol._grant_role(PAUSER_ROLE, pauser);
        self.accesscontrol._grant_role(MINTER_ROLE, minter);
        self.accesscontrol._grant_role(URI_SETTER_ROLE, uri_setter);
        self.accesscontrol._grant_role(UPGRADER_ROLE, upgrader);
        self.erc1155._set_base_uri("ipfs://");
    }

    impl ERC1155HooksImpl of ERC1155Component::ERC1155HooksTrait<ContractState> {
        fn before_update(
            ref self: ERC1155Component::ComponentState<ContractState>,
            from: ContractAddress,
            to: ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
        ) {
            let contract_state = ERC1155Component::HasComponent::get_contract(@self);
            contract_state.pausable.assert_not_paused();
        }

        fn after_update(
            ref self: ERC1155Component::ComponentState<ContractState>,
            from: ContractAddress,
            to: ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
        ) {}
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.accesscontrol.assert_only_role(UPGRADER_ROLE);
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn pause(ref self: ContractState) {
            self.accesscontrol.assert_only_role(PAUSER_ROLE);
            self.pausable.pause();
        }

        #[external(v0)]
        fn unpause(ref self: ContractState) {
            self.accesscontrol.assert_only_role(PAUSER_ROLE);
            self.pausable.unpause();
        }

        #[external(v0)]
        fn burn(ref self: ContractState, account: ContractAddress, token_id: u256, value: u256) {
            let caller = get_caller_address();
            if account != caller {
                assert(
                    self.erc1155.is_approved_for_all(account, caller),
                    ERC1155Component::Errors::UNAUTHORIZED,
                );
            }
            self.erc1155.burn(account, token_id, value);
        }

        #[external(v0)]
        fn batch_burn(
            ref self: ContractState,
            account: ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
        ) {
            let caller = get_caller_address();
            if account != caller {
                assert(
                    self.erc1155.is_approved_for_all(account, caller),
                    ERC1155Component::Errors::UNAUTHORIZED,
                );
            }
            self.erc1155.batch_burn(account, token_ids, values);
        }

        #[external(v0)]
        fn mint(
            ref self: ContractState,
            account: ContractAddress,
            token_id: u256,
            value: u256,
            data: Span<felt252>,
        ) {
            self.accesscontrol.assert_only_role(MINTER_ROLE);
            self.erc1155.mint_with_acceptance_check(account, token_id, value, data);
        }

        #[external(v0)]
        fn mint_item(
            ref self: ContractState,
            recipient: ContractAddress,
            token_id: u256,
            value: u256,
            data: Span<felt252>,
            uri: ByteArray,
        ) {
            self.accesscontrol.assert_only_role(MINTER_ROLE);
            self.erc1155.mint_with_acceptance_check(recipient, token_id, value, data);
            self.erc1155._set_base_uri(uri);
        }

        #[external(v0)]
        fn batch_mint(
            ref self: ContractState,
            account: ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
            data: Span<felt252>,
        ) {
            self.accesscontrol.assert_only_role(MINTER_ROLE);
            self.erc1155.batch_mint_with_acceptance_check(account, token_ids, values, data);
        }

        #[external(v0)]
        fn set_base_uri(ref self: ContractState, base_uri: ByteArray) {
            self.accesscontrol.assert_only_role(URI_SETTER_ROLE);
            self.erc1155._set_base_uri(base_uri);
        }

        #[external(v0)]
        fn set_minter(ref self: ContractState, minter: ContractAddress) {
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);
            self.accesscontrol._grant_role(MINTER_ROLE, minter);
        }
    }
}
