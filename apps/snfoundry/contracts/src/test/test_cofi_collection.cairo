use contracts::cofi_collection::ICofiCollectionDispatcher;
use contracts::cofi_collection::ICofiCollectionDispatcherTrait;

use openzeppelin::utils::serde::SerializedAppend;

use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address};
use starknet::ContractAddress;

fn OWNER() -> ContractAddress {
    starknet::contract_address_const::<'OWNER'>()
}

fn deploy_receiver() -> ContractAddress {
    let contract = declare("Receiver").unwrap().contract_class();
    let calldata = array![];
    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    println!("Receiver deployed on: {:?}", contract_address);
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

#[test]
fn test_safe_mint() {
    let cofi_collection = deploy_cofi_collection();
    let receiver = deploy_receiver();

    // OWNER does the transactions to cofi_collection
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    let token_id = 1_u256;
    let value = 1_u256;
    let data: Array<felt252> = array![0];
    let span = data.span();

    cofi_collection.mint(receiver, token_id, value, span);
    let balance = cofi_collection.balance_of(receiver, token_id);
    assert(balance == value, 'Incorrect balance');
}

#[test]
fn test_burn() {
    let cofi_collection = deploy_cofi_collection();
    let receiver = deploy_receiver();

    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    let token_id = 1_u256;
    let initial_value = 10_u256;
    let burn_value = 3_u256;
    let data: Array<felt252> = array![];

    // Mint tokens
    cofi_collection.mint(receiver, token_id, initial_value, data.span());
    
    // Check initial balance
    let initial_balance = cofi_collection.balance_of(receiver, token_id);
    assert(initial_balance == initial_value, 'Incorrect initial balance');

    // Burn tokens
    cofi_collection.burn(receiver, token_id, burn_value);

    // Check final balance
    let final_balance = cofi_collection.balance_of(receiver, token_id);
    assert(final_balance == initial_value - burn_value, 'Incorrect final balance');

    // Try to burn more tokens than available
    let result = cofi_collection.burn(receiver, token_id, initial_value);
    assert(result == (), 'Burn should not return a value');

    // Check balance after attempting to burn more than available
    let balance_after_failed_burn = cofi_collection.balance_of(receiver, token_id);
    assert(balance_after_failed_burn == initial_value - burn_value, 'Balance should not change');

    // Try to burn from non-existent token
    let non_existent_token_id = 999_u256;
    let result = cofi_collection.burn(receiver, non_existent_token_id, 1_u256);
    assert(result == (), 'Burn should not return a value');

    // Check balance of non-existent token
    let non_existent_balance = cofi_collection.balance_of(receiver, non_existent_token_id);
    assert(non_existent_balance == 0, 'Balance should be 0');
}


#[test]
fn test_balance_of() {
    let cofi_collection = deploy_cofi_collection();
    let receiver = deploy_receiver();

    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    let token_id = 1_u256;
    let value = 5_u256;
    let data: Array<felt252> = array![];

    cofi_collection.mint(receiver, token_id, value, data.span());

    let balance = cofi_collection.balance_of(receiver, token_id);
    assert(balance == value, 'Incorrect balance');

    // Test balance of non-existent token
    let non_existent_token_id = 999_u256;
    let zero_balance = cofi_collection.balance_of(receiver, non_existent_token_id);
    assert(zero_balance == 0, 'Unexpected balance');

    // Test balance of different account
    let different_account = starknet::contract_address_const::<'DIFFERENT'>();
    let different_account_balance = cofi_collection.balance_of(different_account, token_id);
    assert(different_account_balance == 0, 'Unexpected balance');
}

#[test]
fn test_balance_of_batch() {
    let cofi_collection = deploy_cofi_collection();
    let receiver1 = deploy_receiver();
    let receiver2 = deploy_receiver();

    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    let token_id1 = 1_u256;
    let token_id2 = 2_u256;
    let value1 = 5_u256;
    let value2 = 10_u256;
    let data: Array<felt252> = array![];

    cofi_collection.mint(receiver1, token_id1, value1, data.span());
    cofi_collection.mint(receiver2, token_id2, value2, data.span());

    let accounts: Array<ContractAddress> = array![receiver1, receiver2];
    let token_ids: Array<u256> = array![token_id1, token_id2];
    
    let balances = cofi_collection.balance_of_batch(accounts.span(), token_ids.span());
    
    assert(*balances[0] == value1, 'Incorrect balance for receiver1');
    assert(*balances[1] == value2, 'Incorrect balance for receiver2');

    // Test with non-existent token
    let non_existent_token_id = 999_u256;
    let accounts2: Array<ContractAddress> = array![receiver1, receiver2];
    let token_ids2: Array<u256> = array![token_id1, non_existent_token_id];
    
    let balances2 = cofi_collection.balance_of_batch(accounts2.span(), token_ids2.span());
    
    assert(*balances2[0] == value1, 'Wrong balance');
    assert(*balances2[1] == 0, 'Wrong balance');
}

