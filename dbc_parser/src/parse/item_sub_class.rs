use anyhow::Result;
use std::{collections::HashMap, io::Cursor};
use wow_dbc::{
    DbcTable,
    wrath_tables::item_sub_class::{ItemSubClass as DbcItemSubClass, ItemSubClassRow},
};
use wow_mpq::FileEntry;

use crate::parse::Handler;

#[derive(Debug, Default)]
pub struct ItemSubClasses {
    items: HashMap<(i32, i32), ItemSubClassRow>,
}

impl ItemSubClasses {
    pub fn get(&self, class_id: i32, sub_class_id: i32) -> Option<&ItemSubClassRow> {
        self.items.get(&(class_id, sub_class_id))
    }
}

impl Handler for ItemSubClasses {
    fn parse(&mut self, file_entry: &FileEntry, data: &[u8]) -> Result<()> {
        let mut cursor = Cursor::new(data);
        println!("{}", file_entry.name);
        if let Ok(parsed) = DbcItemSubClass::read(&mut cursor) {
            println!(
                "  Found {} with {} entries for ItemSubClasses",
                file_entry.name,
                parsed.rows().len()
            );

            // Insert with deduplication (last wins due to HashMap behavior)
            for row in parsed.rows() {
                self.items
                    .insert((row.class_id, row.sub_class_id), row.clone());
            }
        }
        Ok(())
    }

    fn finish(&self) {
        println!("ItemSubClasses finished with {} entries", self.items.len());
    }
}
