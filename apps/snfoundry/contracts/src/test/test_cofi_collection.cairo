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
    calldata.append_serde(OWNER());

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
    let data: Span<felt252> = array![0].span();

    cofi_collection.mint(receiver, token_id, value, data);
    let balance = cofi_collection.balance_of(receiver, token_id);
    assert(balance == value, 'Incorrect balance');
}
