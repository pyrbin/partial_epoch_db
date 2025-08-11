use anyhow::Result;
use clap::{Parser, ValueEnum};
use std::{fs, path::PathBuf};
use wow_dbc::wrath_tables::{item_display_info::ItemDisplayInfoKey, spell::SpellKey};

mod models;
mod parse;
mod utils;

use models::{DataminedBeta3Map, Item, Rarity};
use parse::{collect_mpqs, parse_dbcs};
use utils::OriginalItemChecker;

use crate::{
    models::ItemSet,
    parse::{
        item::Items, item_class::ItemClasses, item_display_info::ItemDisplayInfos,
        item_sets::ItemSets, item_sub_class::ItemSubClasses,
        spell_description_vars::SpellDescriptionVars, spells::Spells,
    },
};

#[derive(Parser)]
#[command(author, version, about = "WotLK 3.3.5 Item Data Parser & Exporter")]
struct Args {
    #[arg(long, help = "Path to WoW Data directory")]
    data_dir: PathBuf,

    #[arg(
        short,
        long,
        default_value = "items_full",
        help = "Output file name (without extension)"
    )]
    output: String,

    #[arg(short, long, default_value = "json", help = "Output format")]
    format: OutputFormat,
}

#[derive(ValueEnum, Clone)]
enum OutputFormat {
    Json,
    Ron,
}

fn load_datamined_beta_3() -> Result<DataminedBeta3Map> {
    let content = fs::read_to_string("data/parsed_items.json")?;
    let parsed_items: DataminedBeta3Map = serde_json::from_str(&content)?;
    Ok(parsed_items)
}

#[tokio::main]
async fn main() -> Result<()> {
    let args = Args::parse();

    println!("Scanning for MPQ files in: {}", args.data_dir.display());
    let enus_dir = args.data_dir.join("enUS");

    // Load MPQs in priority order
    let mut mpq_paths = collect_mpqs(&args.data_dir)?;
    if enus_dir.exists() {
        mpq_paths.extend(collect_mpqs(&enus_dir)?);
    }

    if mpq_paths.is_empty() {
        anyhow::bail!("No MPQ files found in data directory");
    }

    println!("Found {} MPQ files", mpq_paths.len());

    // Set up DBC parsing pipeline
    let mut items = Items::default();
    let mut item_display_infos = ItemDisplayInfos::default();
    let mut item_classes = ItemClasses::default();
    let mut item_sub_classes = ItemSubClasses::default();
    let mut item_sets = ItemSets::default();
    let mut spells = Spells::default();
    let mut spells_desc_vars = SpellDescriptionVars::default();

    {
        let mut handlers: Vec<&mut dyn parse::Handler> = vec![
            &mut items,
            &mut item_display_infos,
            &mut item_classes,
            &mut item_sub_classes,
            &mut item_sets,
            &mut spells,
            &mut spells_desc_vars,
        ];
        parse_dbcs(&mpq_paths, &mut handlers)?;
    }

    // Load parsed items data for supplementation
    let datamined_items = load_datamined_beta_3().unwrap_or_default();
    println!("Loaded {} datamined entries", datamined_items.len());

    let items: Vec<Item> = items
        .iter_rows()
        .map(|item_row| {
            let mut item = Item::from(item_row);

            if let Some(display_info) =
                item_display_infos.get(ItemDisplayInfoKey::new(item_row.display_info_id))
            {
                item.inventory_icon = display_info.inventory_icon[0].clone();
                item.inventory_icon = format!(
                    "https://wotlk.evowow.com/static/images/wow/icons/large/{}.jpg",
                    item.inventory_icon.to_lowercase()
                );
            }

            if let Some(item_sub_class) =
                item_sub_classes.get(item_row.class_id, item_row.subclass_id)
            {
                item.subclass = item_sub_class.display_name_lang.en_gb.clone();
            }

            if let Some(item_set) = item_sets.find_by_item_ids(&[item_row.id]) {
                let spells = item_set
                    .set_spell_id
                    .iter()
                    .zip(item_set.set_threshold)
                    .filter_map(|(s, t)| {
                        spells.get(SpellKey::new(*s)).map(|spell| {
                            if let Some(spell_vars) =
                                spells_desc_vars.get(spell.description_variables_id)
                            {
                                (t as u32, spell_vars.variables.clone())
                            } else {
                                (t as u32, spell.description_lang.en_gb.clone())
                            }
                        })
                    })
                    .collect();
                item.set = Some(ItemSet {
                    id: item_set.id.id,
                    name: item_set.name_lang.en_gb.clone(),
                    spells,
                })
            }

            // Supplement with data from parsed_items.json
            if let Some(parsed_data) = datamined_items.get(&item.id.to_string()) {
                if !parsed_data.name.is_empty() {
                    item.name = parsed_data.name.clone();
                }
                if let Some(rarity_type) = &parsed_data.rarity_type {
                    item.rarity = Rarity::from(rarity_type.clone());
                }
                if let Some(stats) = &parsed_data.stats {
                    if !stats.is_empty() {
                        item.stats = stats.clone();
                    }
                }
                if let Some(spells) = &parsed_data.spells {
                    if !spells.is_empty() {
                        item.spells = spells.clone();
                    }
                }
                if let Some(requires) = &parsed_data.requires {
                    if !requires.is_empty() {
                        item.requires = requires.clone();
                    }
                }
                if let Some(level) = parsed_data.requires_level {
                    item.required_level = level;
                }
                if let Some(damage) = &parsed_data.damage {
                    if !damage.is_empty() {
                        item.damage = damage.clone();
                    }
                }
                if let Some(added_damage) = &parsed_data.added_damage {
                    if !added_damage.is_empty() {
                        item.added_damage = added_damage.clone();
                    }
                }
                if let Some(armor) = &parsed_data.armor {
                    if !armor.is_empty() {
                        item.armor = armor.clone();
                    }
                }
                if let Some(dps) = &parsed_data.dps {
                    if !dps.is_empty() {
                        item.dps = dps.clone();
                    }
                }
                if let Some(speed) = &parsed_data.speed {
                    if !speed.is_empty() {
                        item.speed = speed.clone();
                    }
                }
                if let Some(bonding) = &parsed_data.bonding {
                    if !bonding.is_empty() {
                        item.bonding = bonding.clone();
                    }
                }
                if let Some(hands) = &parsed_data.hands {
                    if !hands.is_empty() {
                        item.hands = hands.clone();
                    }
                }
            }

            item
        })
        .filter(|item| item.required_level <= 60)
        .collect();

    // Filter out items that exist in item_template.csv (keep only new items)
    let checker = OriginalItemChecker::new()?;
    let mut filtered_items = Vec::new();

    println!("Filtering {} items against CSV data...", items.len());

    for item in items {
        if checker.is_item_new(item.id) {
            filtered_items.push(item);
        }
    }

    println!(
        "Filtered to {} new items (not in CSV)",
        filtered_items.len()
    );

    let mut items = filtered_items;
    items.sort_by_key(|i| i.id);

    // Write output file
    let output_path = match args.format {
        OutputFormat::Json => {
            let path = format!("{}.json", args.output);
            let json = serde_json::to_string_pretty(&items)?;
            fs::write(&path, json)?;
            path
        }
        OutputFormat::Ron => {
            let path = format!("{}.ron", args.output);
            let ron = ron::to_string(&items)?;
            fs::write(&path, ron)?;
            path
        }
    };

    println!(
        "Successfully exported {} items to: {}",
        items.len(),
        output_path
    );

    Ok(())
}
