use anyhow::Result;
use std::{collections::HashMap, io::Cursor};
use wow_dbc::{
    DbcTable,
    wrath_tables::item_class::{ItemClass as DbcItemClass, ItemClassRow},
};
use wow_mpq::FileEntry;

use crate::parse::Handler;

#[derive(Debug, Default)]
pub struct ItemClasses {
    items: HashMap<i32, ItemClassRow>,
}

impl ItemClasses {
    #[allow(dead_code)]
    pub fn get(&self, id: i32) -> Option<&ItemClassRow> {
        self.items.get(&id)
    }
}

impl Handler for ItemClasses {
    fn parse(&mut self, file_entry: &FileEntry, data: &[u8]) -> Result<()> {
        let mut cursor = Cursor::new(data);
        println!("{}", file_entry.name);
        if let Ok(parsed) = DbcItemClass::read(&mut cursor) {
            println!(
                "  Found {} with {} entries for ItemClasses",
                file_entry.name,
                parsed.rows().len()
            );

            // Insert with deduplication (last wins due to HashMap behavior)
            for row in parsed.rows() {
                self.items.insert(row.class_id, row.clone());
            }
        }
        Ok(())
    }

    fn finish(&self) {
        println!("ItemClasses finished with {} entries", self.items.len());
    }
}
