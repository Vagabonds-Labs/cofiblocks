use starknet::ContractAddress;
use starknet::testing::{set_caller_address, set_contract_address};
use snforge_std::{declare, ContractClassTrait, start_prank, stop_prank};
use openzeppelin::token::erc1155::interface::{IERC1155Dispatcher, IERC1155DispatcherTrait};
use openzeppelin::access::ownable::interface::{IOwnableDispatcher, IOwnableDispatcherTrait};

use contracts::CofiCollection;

fn deploy_contract() -> ContractAddress {
    let contract = declare('CofiCollection');
    let owner = starknet::contract_address_const::<0x123>();
    contract.deploy(@array![owner.into()]).unwrap()
}

#[test]
fn test_constructor() {
    let contract_address = deploy_contract();
    let dispatcher = IERC1155Dispatcher { contract_address };
    let ownable_dispatcher = IOwnableDispatcher { contract_address };

    let owner = starknet::contract_address_const::<0x123>();
    assert(ownable_dispatcher.owner() == owner, 'Owner should be set correctly');
    assert(dispatcher.uri(0) == '', 'URI should be empty initially');
}

#[test]
fn test_mint() {
    let contract_address = deploy_contract();
    let dispatcher = IERC1155Dispatcher { contract_address };
    let owner = starknet::contract_address_const::<0x123>();
    let recipient = starknet::contract_address_const::<0x456>();
    let token_id = 1_u256;
    let amount = 10_u256;

    start_prank(contract_address, owner);
    dispatcher.mint(recipient, token_id, amount, array![]);
    stop_prank(contract_address);

    assert(dispatcher.balance_of(recipient, token_id) == amount, 'Incorrect balance after mint');
}

#[test]
fn test_batch_mint() {
    let contract_address = deploy_contract();
    let dispatcher = IERC1155Dispatcher { contract_address };
    let owner = starknet::contract_address_const::<0x123>();
    let recipient = starknet::contract_address_const::<0x456>();
    let token_ids = array![1_u256, 2_u256, 3_u256];
    let amounts = array![10_u256, 20_u256, 30_u256];

    start_prank(contract_address, owner);
    dispatcher.batch_mint(recipient, token_ids.span(), amounts.span(), array![]);
    stop_prank(contract_address);

    assert(dispatcher.balance_of(recipient, 1_u256) == 10_u256, 'Incorrect balance for token 1');
    assert(dispatcher.balance_of(recipient, 2_u256) == 20_u256, 'Incorrect balance for token 2');
    assert(dispatcher.balance_of(recipient, 3_u256) == 30_u256, 'Incorrect balance for token 3');
}

#[test]
fn test_burn() {
    let contract_address = deploy_contract();
    let dispatcher = IERC1155Dispatcher { contract_address };
    let owner = starknet::contract_address_const::<0x123>();
    let token_id = 1_u256;
    let mint_amount = 10_u256;
    let burn_amount = 5_u256;

    start_prank(contract_address, owner);
    dispatcher.mint(owner, token_id, mint_amount, array![]);
    dispatcher.burn(owner, token_id, burn_amount);
    stop_prank(contract_address);

    assert(dispatcher.balance_of(owner, token_id) == mint_amount - burn_amount, 'Incorrect balance after burn');
}

#[test]
fn test_batch_burn() {
    let contract_address = deploy_contract();
    let dispatcher = IERC1155Dispatcher { contract_address };
    let owner = starknet::contract_address_const::<0x123>();
    let token_ids = array![1_u256, 2_u256, 3_u256];
    let mint_amounts = array![10_u256, 20_u256, 30_u256];
    let burn_amounts = array![5_u256, 10_u256, 15_u256];

    start_prank(contract_address, owner);
    dispatcher.batch_mint(owner, token_ids.span(), mint_amounts.span(), array![]);
    dispatcher.batch_burn(owner, token_ids.span(), burn_amounts.span());
    stop_prank(contract_address);

    assert(dispatcher.balance_of(owner, 1_u256) == 5_u256, 'Incorrect balance for token 1 after burn');
    assert(dispatcher.balance_of(owner, 2_u256) == 10_u256, 'Incorrect balance for token 2 after burn');
    assert(dispatcher.balance_of(owner, 3_u256) == 15_u256, 'Incorrect balance for token 3 after burn');
}

#[test]
fn test_set_base_uri() {
    let contract_address = deploy_contract();
    let dispatcher = IERC1155Dispatcher { contract_address };
    let owner = starknet::contract_address_const::<0x123>();
    let new_uri = 'https://example.com/token/';

    start_prank(contract_address, owner);
    dispatcher.set_base_uri(new_uri);
    stop_prank(contract_address);

    assert(dispatcher.uri(0) == new_uri, 'Base URI not set correctly');
}

#[test]
#[should_panic(expected: ('Caller is not the owner', 'ENTRYPOINT_FAILED'))]
fn test_set_base_uri_not_owner() {
    let contract_address = deploy_contract();
    let dispatcher = IERC1155Dispatcher { contract_address };
    let not_owner = starknet::contract_address_const::<0x456>();
    let new_uri = 'https://example.com/token/';

    start_prank(contract_address, not_owner);
    dispatcher.set_base_uri(new_uri);
    stop_prank(contract_address);
}
