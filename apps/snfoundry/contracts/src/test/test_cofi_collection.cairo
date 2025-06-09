use contracts::cofi_collection::{ICofiCollectionDispatcher, ICofiCollectionDispatcherTrait};
use openzeppelin::utils::serde::SerializedAppend;
use snforge_std::{ContractClassTrait, DeclareResultTrait, declare, start_cheat_caller_address};
use starknet::ContractAddress;

fn OWNER() -> ContractAddress {
    'OWNER'.try_into().unwrap()
}

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

#[test]
#[available_gas(l2_gas: 18446744073709551615)]
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
    let different_account = 'DIFFERENT'.try_into().unwrap();
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


#[test]
fn test_batch_mint() {
    let cofi_collection = deploy_cofi_collection();
    let receiver = deploy_receiver();
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    let token_id1 = 1_u256;
    let token_id2 = 2_u256;
    let mint_value1 = 10_u256;
    let mint_value2 = 20_u256;
    let data: Array<felt252> = array![];

    // Prepare batch mint data
    let token_ids: Array<u256> = array![token_id1, token_id2];
    let mint_values: Array<u256> = array![mint_value1, mint_value2];

    // Batch mint tokens
    cofi_collection.batch_mint(receiver, token_ids.span(), mint_values.span(), data.span());

    // Check balances after minting
    let balance1 = cofi_collection.balance_of(receiver, token_id1);
    let balance2 = cofi_collection.balance_of(receiver, token_id2);
    assert(balance1 == mint_value1, 'Incorrect balance for token 1');
    assert(balance2 == mint_value2, 'Incorrect balance for token 2');

    // Test minting additional tokens
    let additional_value1 = 5_u256;
    let additional_value2 = 8_u256;
    let additional_values: Array<u256> = array![additional_value1, additional_value2];

    cofi_collection.batch_mint(receiver, token_ids.span(), additional_values.span(), data.span());

    // Check updated balances
    let updated_balance1 = cofi_collection.balance_of(receiver, token_id1);
    let updated_balance2 = cofi_collection.balance_of(receiver, token_id2);
    assert(updated_balance1 == mint_value1 + additional_value1, 'Wrong balance 1');
    assert(updated_balance2 == mint_value2 + additional_value2, 'Wrong balance 2');
}


#[test]
fn test_batch_burn() {
    let cofi_collection = deploy_cofi_collection();
    let receiver = deploy_receiver();
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    let token_id1 = 1_u256;
    let token_id2 = 2_u256;
    let initial_value1 = 10_u256;
    let initial_value2 = 20_u256;
    let burn_value1 = 3_u256;
    let burn_value2 = 5_u256;
    let data: Array<felt252> = array![];

    // Mint tokens
    cofi_collection.mint(receiver, token_id1, initial_value1, data.span());
    cofi_collection.mint(receiver, token_id2, initial_value2, data.span());

    // Check initial balances
    let initial_balance1 = cofi_collection.balance_of(receiver, token_id1);
    let initial_balance2 = cofi_collection.balance_of(receiver, token_id2);
    assert(initial_balance1 == initial_value1, 'Incorrect initial balance 1');
    assert(initial_balance2 == initial_value2, 'Incorrect initial balance 2');

    // Approve OWNER() to burn tokens on behalf of receiver
    start_cheat_caller_address(cofi_collection.contract_address, receiver);
    cofi_collection.set_approval_for_all(OWNER(), true);

    // Switch back to OWNER() as caller
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    // Batch burn tokens
    let token_ids: Array<u256> = array![token_id1, token_id2];
    let burn_values: Array<u256> = array![burn_value1, burn_value2];
    cofi_collection.batch_burn(receiver, token_ids.span(), burn_values.span());

    // Check final balances
    let final_balance1 = cofi_collection.balance_of(receiver, token_id1);
    let final_balance2 = cofi_collection.balance_of(receiver, token_id2);
    assert(final_balance1 == initial_value1 - burn_value1, 'Incorrect final balance 1');
    assert(final_balance2 == initial_value2 - burn_value2, 'Incorrect final balance 2');
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

    // Check initial balance of receiver
    let initial_balance = cofi_collection.balance_of(receiver, token_id);
    assert(initial_balance == initial_value, 'Incorrect initial balance');

    // Approve OWNER() to burn tokens on behalf of receiver
    start_cheat_caller_address(cofi_collection.contract_address, receiver);
    cofi_collection.set_approval_for_all(OWNER(), true);

    // Switch back to OWNER() as caller
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    // Burn tokens
    cofi_collection.burn(receiver, token_id, burn_value);

    // Check final balance
    let final_balance = cofi_collection.balance_of(receiver, token_id);
    assert(final_balance == initial_value - burn_value, 'Incorrect final balance');
}

#[test]
fn test_safe_transfer_from() {
    let cofi_collection = deploy_cofi_collection();
    let sender = deploy_receiver();
    let receiver = deploy_receiver();
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    let token_id = 1_u256;
    let initial_value = 10_u256;
    let transfer_value = 3_u256;
    let data: Array<felt252> = array![];

    // Mint tokens to sender
    cofi_collection.mint(sender, token_id, initial_value, data.span());

    // Check initial balance of sender
    let sender_initial_balance = cofi_collection.balance_of(sender, token_id);
    assert(sender_initial_balance == initial_value, 'Wrong initial balance');

    // Approve OWNER() to transfer tokens on behalf of sender
    start_cheat_caller_address(cofi_collection.contract_address, sender);
    cofi_collection.set_approval_for_all(OWNER(), true);

    // Switch back to OWNER() as caller
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    // Perform safe_transfer_from
    cofi_collection.safe_transfer_from(sender, receiver, token_id, transfer_value, data.span());

    // Check final balances
    let sender_final_balance = cofi_collection.balance_of(sender, token_id);
    let receiver_final_balance = cofi_collection.balance_of(receiver, token_id);
    assert(sender_final_balance == initial_value - transfer_value, 'Wrong sender balance');
    assert(receiver_final_balance == transfer_value, 'Wrong receiver balance');
}


#[test]
fn test_safe_batch_transfer_from() {
    let cofi_collection = deploy_cofi_collection();
    let sender = deploy_receiver();
    let receiver = deploy_receiver();
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    let token_id1 = 1_u256;
    let token_id2 = 2_u256;
    let initial_value1 = 10_u256;
    let initial_value2 = 20_u256;
    let transfer_value1 = 3_u256;
    let transfer_value2 = 5_u256;
    let data: Array<felt252> = array![];

    // Mint tokens to sender
    cofi_collection.mint(sender, token_id1, initial_value1, data.span());
    cofi_collection.mint(sender, token_id2, initial_value2, data.span());

    // Check initial balances of sender
    let sender_initial_balance1 = cofi_collection.balance_of(sender, token_id1);
    let sender_initial_balance2 = cofi_collection.balance_of(sender, token_id2);
    assert(sender_initial_balance1 == initial_value1, 'Wrong initial balance 1');
    assert(sender_initial_balance2 == initial_value2, 'Wrong initial balance 2');

    // Approve OWNER() to transfer tokens on behalf of sender
    start_cheat_caller_address(cofi_collection.contract_address, sender);
    cofi_collection.set_approval_for_all(OWNER(), true);

    // Switch back to OWNER() as caller
    start_cheat_caller_address(cofi_collection.contract_address, OWNER());

    // Prepare token_ids and values for batch transfer
    let token_ids: Array<u256> = array![token_id1, token_id2];
    let values: Array<u256> = array![transfer_value1, transfer_value2];

    // Perform safe_batch_transfer_from
    cofi_collection
        .safe_batch_transfer_from(sender, receiver, token_ids.span(), values.span(), data.span());

    // Check final balances
    let sender_final_balance1 = cofi_collection.balance_of(sender, token_id1);
    let sender_final_balance2 = cofi_collection.balance_of(sender, token_id2);
    let receiver_final_balance1 = cofi_collection.balance_of(receiver, token_id1);
    let receiver_final_balance2 = cofi_collection.balance_of(receiver, token_id2);

    assert(sender_final_balance1 == initial_value1 - transfer_value1, 'Wrong sender balance 1');
    assert(sender_final_balance2 == initial_value2 - transfer_value2, 'Wrong sender balance 2');
    assert(receiver_final_balance1 == transfer_value1, 'Wrong receiver balance 1');
    assert(receiver_final_balance2 == transfer_value2, 'Wrong receiver balance 2');
}


#[test]
fn test_set_approval_for_all() {
    let cofi_collection = deploy_cofi_collection();
    let owner = OWNER();
    let operator = deploy_receiver();

    // Check initial approval status
    let initial_approval = cofi_collection.is_approved_for_all(owner, operator);
    assert(!initial_approval, 'Not approved initially');

    // Set approval
    start_cheat_caller_address(cofi_collection.contract_address, owner);
    cofi_collection.set_approval_for_all(operator, true);

    // Check approval status after setting
    let approval_after_set = cofi_collection.is_approved_for_all(owner, operator);
    assert(approval_after_set, 'Approval should be true');

    // Revoke approval
    cofi_collection.set_approval_for_all(operator, false);

    // Check approval status after revoking
    let approval_after_revoke = cofi_collection.is_approved_for_all(owner, operator);
    assert(!approval_after_revoke, 'Approval should be false');
}


#[test]
#[should_panic]
fn test_pause() {
    let cofi_collection = deploy_cofi_collection();
    let owner = OWNER();
    let token_id = 1_u256;
    let amount = 100_u256;
    let sender = deploy_receiver();
    let receiver = deploy_receiver();

    // Mint some tokens
    start_cheat_caller_address(cofi_collection.contract_address, owner);
    cofi_collection.mint(sender, token_id, amount, array![].span());

    // Send tokens to the sender
    start_cheat_caller_address(cofi_collection.contract_address, sender);
    cofi_collection.safe_transfer_from(sender, receiver, token_id, amount, array![].span());

    // Verify the sender's balance
    let sender_balance = cofi_collection.balance_of(sender, token_id);
    assert(sender_balance == amount, 'Transfer to sender failed');

    // Pause the contract
    start_cheat_caller_address(cofi_collection.contract_address, owner);
    cofi_collection.pause();

    // Try to transfer tokens while paused (should fail)
    start_cheat_caller_address(cofi_collection.contract_address, sender);
    cofi_collection.safe_transfer_from(sender, receiver, token_id, amount, array![].span());

    // Assert that the transfer failed due to the contract being paused
    let receiver_balance = cofi_collection.balance_of(receiver, token_id);
    assert(receiver_balance == 0, 'No transfer');

    // Unpause the contract
    start_cheat_caller_address(cofi_collection.contract_address, owner);
    cofi_collection.unpause();

    // Transfer should now succeed
    start_cheat_caller_address(cofi_collection.contract_address, sender);
    cofi_collection.safe_transfer_from(sender, receiver, token_id, amount, array![].span());
    let receiver_balance = cofi_collection.balance_of(receiver, token_id);
    assert(receiver_balance == amount, 'Transfer failed after unpause');
}

#[test]
fn test_uri() {
    let cofi_collection = deploy_cofi_collection();
    let owner = OWNER();
    let token_id = 1_u256;
    let base_uri: ByteArray = "https://api.example.com/token/";

    // Set the base URI
    start_cheat_caller_address(cofi_collection.contract_address, owner);
    cofi_collection.set_base_uri(base_uri.clone());

    // Check the URI for a token
    let token_uri = cofi_collection.uri(token_id);
    assert(token_uri == base_uri, 'Incorrect token URI');

    // Test with a different token ID
    let another_token_id = 42_u256;
    let another_token_uri = cofi_collection.uri(another_token_id);
    assert(another_token_uri == base_uri, 'Incorrect token URI');
}


#[test]
fn test_mint_item() {
    let cofi_collection = deploy_cofi_collection();
    let owner = OWNER();
    let token_id = 1_u256;
    let uri: ByteArray = "https://api.example.com/token/";
    let value = 1_u256;
    let data: Array<felt252> = array![];
    let receiver = deploy_receiver();

    start_cheat_caller_address(cofi_collection.contract_address, owner);
    cofi_collection.mint_item(receiver, token_id, value, data.span(), uri.clone());

    let balance = cofi_collection.balance_of(receiver, token_id);
    assert(balance == value, 'Incorrect balance');

    let token_uri = cofi_collection.uri(token_id);
    assert(token_uri == uri, 'Incorrect token URI');
}
