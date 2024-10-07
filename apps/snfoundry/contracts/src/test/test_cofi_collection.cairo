use starknet::ContractAddress;

use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address_global};


use contracts::cofi_collection::ICofiCollectionDispatcher;
use contracts::cofi_collection::ICofiCollectionDispatcherTrait;

fn OWNER() -> ContractAddress {
    starknet::contract_address_const::<'OWNER'>()
}


fn deploy_contract() -> ContractAddress {
    let owner = OWNER();
    let contract = declare("CofiCollection").unwrap().contract_class();
    let mut constructor_calldata = array![];
    constructor_calldata.append(owner.into());
    let (contract_address, _) = contract.deploy(@constructor_calldata).expect('Project deployment failed');

    contract_address
}

// #[test]
// fn test_safe_mint() {
//     let contract_address = deploy_contract();
//     println!("contract_address--->: {:?}", contract_address);

//     let account = OWNER();
//     start_cheat_caller_address_global(account);
//     let erc1155_dispatcher = ICofiCollectionDispatcher { contract_address };
    

//     let token_id = 1_u256;
//     let value = 1_u256;
//     let data: Span<felt252> = array![0].span();

//     erc1155_dispatcher.mint(account.into(), token_id, value, data);
//     let balance = erc1155_dispatcher.balance_of(account, token_id);
//     assert(balance == value, 'Incorrect balance');
// }