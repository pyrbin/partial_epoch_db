use anyhow::Result;
use std::{collections::HashMap, io::Cursor};
use wow_dbc::{
    DbcTable,
    wrath_tables::item::{Item as DbcItem, ItemKey, ItemRow},
};
use wow_mpq::FileEntry;

use crate::parse::Handler;

#[derive(Debug, Default)]
pub struct Items {
    items: HashMap<ItemKey, ItemRow>,
}

impl Items {
    pub fn iter_rows(&self) -> impl Iterator<Item = &ItemRow> {
        self.items.values()
    }
}

impl Handler for Items {
    fn parse(&mut self, file_entry: &FileEntry, data: &[u8]) -> Result<()> {
        let mut cursor = Cursor::new(data);
        println!("{}", file_entry.name);
        if let Ok(parsed) = DbcItem::read(&mut cursor) {
            println!(
                "  Found {} with {} entries for Items",
                file_entry.name,
                parsed.rows().len()
            );

            // Insert with deduplication (last wins due to HashMap behavior)
            for row in parsed.rows() {
                self.items.insert(row.id, *row);
            }
        }
        Ok(())
    }

    fn finish(&self) {
        println!("Items finished with {} entries", self.items.len());
    }
}
