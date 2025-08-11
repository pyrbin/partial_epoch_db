use anyhow::Result;
use std::{collections::HashSet, fs};

pub struct OriginalItemChecker {
    existing_entries: HashSet<i32>, // Set of item IDs that exist in CSV
}

impl OriginalItemChecker {
    pub fn new() -> Result<Self> {
        let existing_entries = load_csv_entries()?;
        println!(
            "Loaded {} existing entries from item_template.csv",
            existing_entries.len()
        );
        Ok(Self { existing_entries })
    }

    pub fn is_item_new(&self, item_id: i32) -> bool {
        !self.existing_entries.contains(&item_id)
    }

    #[allow(dead_code)]
    pub fn check_items_batch(&self, item_ids: Vec<i32>) -> Vec<(i32, bool)> {
        item_ids
            .into_iter()
            .map(|item_id| (item_id, self.is_item_new(item_id)))
            .collect()
    }
}

fn load_csv_entries() -> Result<HashSet<i32>> {
    let content = fs::read_to_string("data/wotlk_item_template.csv")?;
    let mut existing_entries = HashSet::new();

    let mut rdr = csv::Reader::from_reader(content.as_bytes());
    for result in rdr.records() {
        let record = result?;
        if let Some(entry_str) = record.get(0) {
            // "entry" is the first column
            if let Ok(entry_id) = entry_str.parse::<i32>() {
                existing_entries.insert(entry_id);
            }
        }
    }

    Ok(existing_entries)
}
