use anyhow::Result;
use std::{collections::HashMap, io::Cursor};
use wow_dbc::{
    DbcTable,
    wrath_tables::spell_description_variables::{
        SpellDescriptionVariables as DbcSpellDescriptionVariables, SpellDescriptionVariablesKey,
        SpellDescriptionVariablesRow,
    },
};
use wow_mpq::FileEntry;

use crate::parse::Handler;

#[derive(Debug, Default)]
pub struct SpellDescriptionVars {
    items: HashMap<SpellDescriptionVariablesKey, SpellDescriptionVariablesRow>,
}

impl SpellDescriptionVars {
    pub fn get(&self, id: SpellDescriptionVariablesKey) -> Option<&SpellDescriptionVariablesRow> {
        self.items.get(&id)
    }
}

impl Handler for SpellDescriptionVars {
    fn parse(&mut self, file_entry: &FileEntry, data: &[u8]) -> Result<()> {
        let mut cursor = Cursor::new(data);
        println!("{}", file_entry.name);
        if let Ok(parsed) = DbcSpellDescriptionVariables::read(&mut cursor) {
            println!(
                "  Found {} with {} entries for SpellDescriptionVars",
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
            "SpellDescriptionVars finished with {} entries",
            self.items.len()
        );
    }
}
