use anyhow::Result;
use std::{collections::HashMap, io::Cursor};
use wow_dbc::{
    DbcTable,
    wrath_tables::spell::{Spell as DbcSpell, SpellKey, SpellRow},
};
use wow_mpq::FileEntry;

use crate::parse::Handler;

#[derive(Debug, Default)]
pub struct Spells {
    items: HashMap<SpellKey, SpellRow>,
}

impl Spells {
    pub fn get(&self, id: SpellKey) -> Option<&SpellRow> {
        self.items.get(&id)
    }
}

impl Handler for Spells {
    fn parse(&mut self, file_entry: &FileEntry, data: &[u8]) -> Result<()> {
        let mut cursor = Cursor::new(data);
        println!("{}", file_entry.name);
        if let Ok(parsed) = DbcSpell::read(&mut cursor) {
            println!(
                "  Found {} with {} entries for Spells",
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
        println!("Spells finished with {} entries", self.items.len());
    }
}
