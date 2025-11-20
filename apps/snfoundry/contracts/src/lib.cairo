mod cofi_collection;
mod distribution;
mod marketplace;
pub mod mist;

#[cfg(test)]
mod test {
    mod test_cofi_collection;
    mod test_distribution;
    mod test_marketplace;
}

mod mock_contracts {
    mod Receiver;
}
