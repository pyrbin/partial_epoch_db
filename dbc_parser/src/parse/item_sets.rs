use anyhow::Result;
use std::{collections::HashMap, io::Cursor};
use wow_dbc::{
    DbcTable,
    wrath_tables::{
        item::ItemKey,
        item_set::{ItemSet as DbcItemSet, ItemSetKey, ItemSetRow},
    },
};
use wow_mpq::FileEntry;

use crate::parse::Handler;

#[derive(Debug, Default)]
pub struct ItemSets {
    items: HashMap<ItemSetKey, ItemSetRow>,
}

impl ItemSets {
    #[allow(dead_code)]
    pub fn get(&self, key: ItemSetKey) -> Option<&ItemSetRow> {
        self.items.get(&key)
    }

    pub fn find_by_item_ids(&self, item_ids: &[ItemKey]) -> Option<&ItemSetRow> {
        self.items.values().find(|item_set| {
            item_set
                .item_id
                .iter()
                .any(|item_id| item_ids.contains(&ItemKey::new(*item_id)))
        })
    }
}

impl Handler for ItemSets {
    fn parse(&mut self, file_entry: &FileEntry, data: &[u8]) -> Result<()> {
        let mut cursor = Cursor::new(data);
        println!("{}", file_entry.name);
        if let Ok(parsed) = DbcItemSet::read(&mut cursor) {
            println!(
                "  Found {} with {} entries for ItemSets",
                file_entry.name,
                parsed.rows().len()
            );

            // Insert with deduplication (last wins due to HashMap behavior)
            for row in parsed.rows() {
                self.items.insert(row.id, row.clone());
            }
        }
        Ok(())
    }

    fn finish(&self) {
        println!("ItemSets finished with {} entries", self.items.len());
    }
}
