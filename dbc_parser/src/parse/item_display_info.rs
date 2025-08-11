use anyhow::Result;
use std::{collections::HashMap, io::Cursor};
use wow_dbc::{
    DbcTable,
    wrath_tables::item_display_info::{
        ItemDisplayInfo as DbcItemDisplayInfo, ItemDisplayInfoKey, ItemDisplayInfoRow,
    },
};
use wow_mpq::FileEntry;

use crate::parse::Handler;

#[derive(Debug, Default)]
pub struct ItemDisplayInfos {
    items: HashMap<ItemDisplayInfoKey, ItemDisplayInfoRow>,
}

impl ItemDisplayInfos {
    pub fn get(&self, id: ItemDisplayInfoKey) -> Option<&ItemDisplayInfoRow> {
        self.items.get(&id)
    }
}

impl Handler for ItemDisplayInfos {
    fn parse(&mut self, file_entry: &FileEntry, data: &[u8]) -> Result<()> {
        let mut cursor = Cursor::new(data);
        println!("{}", file_entry.name);
        if let Ok(parsed) = DbcItemDisplayInfo::read(&mut cursor) {
            println!(
                "  Found {} with {} entries for ItemDisplayInfos",
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
        println!(
            "ItemDisplayInfos finished with {} entries",
            self.items.len()
        );
    }
}
