use starknet::ContractAddress;

#[derive(Copy, Drop, starknet::Store, Serde)]
pub struct Asset {
    pub amount: u256,
    pub addr: ContractAddress,
}

#[starknet::interface]
pub trait IChamber<T> {
    fn deposit(ref self: T, hash: u256, asset: Asset);
    fn withdraw_no_zk(
        ref self: T,
        claiming_key: u256,
        recipient: ContractAddress,
        asset: Asset,
        proof: Span<u256>,
    );
    fn seek_and_hide_no_zk(
        ref self: T,
        claiming_key: u256,
        recipient: ContractAddress,
        asset: Asset,
        proof: Span<u256>,
        new_tx_secret: u256,
        new_tx_amount: u256,
    );
    fn handle_zkp(ref self: T, proof: Span<felt252>);
    fn tx_array(self: @T) -> Array<u256>;
    fn merkle_root(self: @T) -> u256;
    fn merkle_proof(ref self: T, index: u32) -> Span<u256>;
    fn merkle_leaves(ref self: T, height: u32) -> Array<u256>;
}
