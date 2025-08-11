use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wow_dbc::wrath_tables::item::ItemRow;

#[derive(Serialize, Clone, Debug)]
pub struct Item {
    pub id: i32,
    pub name: String,
    pub class: ItemClass,
    pub subclass: String,
    pub inventory_icon: String,
    pub inventory_type: InventoryType,
    pub set: Option<ItemSet>,
    pub required_level: u32,
    pub stats: Vec<String>,
    pub spells: Vec<String>,
    pub requires: Vec<String>,
    pub rarity: Rarity,
    pub damage: String,
    pub added_damage: String,
    pub armor: String,
    pub speed: String,
    pub dps: String,
    pub bonding: String,
    pub hands: String,
}

impl From<&ItemRow> for Item {
    fn from(item: &ItemRow) -> Self {
        Item {
            id: item.id.id,
            name: "<unknown>".to_string(), // Placeholder until we cross-reference with string data
            class: ItemClass::from(item.class_id),
            subclass: "".to_string(),
            inventory_icon: String::new(),
            inventory_type: InventoryType::from(item.inventory_type),
            set: None,
            required_level: 0,
            stats: Vec::new(),
            spells: Vec::new(),
            requires: Vec::new(),
            rarity: Rarity::Common,
            damage: "".to_string(),
            added_damage: "".to_string(),
            armor: "".to_string(),
            speed: "".to_string(),
            dps: "".to_string(),
            bonding: "".to_string(),
            hands: "".to_string(),
        }
    }
}

#[derive(Serialize, Clone, Debug)]
pub struct ItemSet {
    pub name: String,
    pub id: i32,
    pub spells: Vec<(u32, String)>,
}

#[repr(u32)]
#[derive(Serialize, Clone, Debug)]
pub enum InventoryType {
    None = 0,
    Head = 1,
    Neck = 2,
    Shoulders = 3,
    Shirt = 4,
    Vest = 5,
    Waist = 6,
    Legs = 7,
    Feet = 8,
    Wrist = 9,
    Hands = 10,
    Ring = 11,
    Trinket = 12,
    OneHand = 13,
    Shield = 14,
    Bow = 15,
    Back = 16,
    TwoHand = 17,
    Bag = 18,
    Tabard = 19,
    Robe = 20,
    MainHand = 21,
    OffHand = 22,
    Held = 23,
    Ammo = 24,
    Thrown = 25,
    Ranged = 26,
    RangedRight = 27, // A reasonable guess for "Ranged (Can't remember what)"
    Relic = 28,
}

impl From<i32> for InventoryType {
    fn from(value: i32) -> Self {
        match value {
            0 => InventoryType::None,
            1 => InventoryType::Head,
            2 => InventoryType::Neck,
            3 => InventoryType::Shoulders,
            4 => InventoryType::Shirt,
            5 => InventoryType::Vest,
            6 => InventoryType::Waist,
            7 => InventoryType::Legs,
            8 => InventoryType::Feet,
            9 => InventoryType::Wrist,
            10 => InventoryType::Hands,
            11 => InventoryType::Ring,
            12 => InventoryType::Trinket,
            13 => InventoryType::OneHand,
            14 => InventoryType::Shield,
            15 => InventoryType::Bow,
            16 => InventoryType::Back,
            17 => InventoryType::TwoHand,
            18 => InventoryType::Bag,
            19 => InventoryType::Tabard,
            20 => InventoryType::Robe,
            21 => InventoryType::MainHand,
            22 => InventoryType::OffHand,
            23 => InventoryType::Held,
            24 => InventoryType::Ammo,
            25 => InventoryType::Thrown,
            26 => InventoryType::Ranged,
            27 => InventoryType::RangedRight,
            28 => InventoryType::Relic,
            _ => InventoryType::None,
        }
    }
}

#[repr(u32)]
#[derive(Serialize, Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum ItemClass {
    Consumable = 0,
    Container = 1,
    Weapon = 2,
    Gem = 3,
    Armor = 4,
    Projectile = 5,
    TradeGoods = 6,
    Generic = 7,
    Recipe = 8,
    Money = 9,
    Quiver = 10,
    Quest = 11,
    Key = 12,
    Permanent = 13,
    Miscellaneous = 15,
    Glyph = 16,
    Custom(i32),
}

impl From<i32> for ItemClass {
    fn from(value: i32) -> Self {
        match value {
            0 => ItemClass::Consumable,
            1 => ItemClass::Container,
            2 => ItemClass::Weapon,
            3 => ItemClass::Gem,
            4 => ItemClass::Armor,
            5 => ItemClass::Projectile,
            6 => ItemClass::TradeGoods,
            7 => ItemClass::Generic,
            8 => ItemClass::Recipe,
            9 => ItemClass::Money,
            10 => ItemClass::Quiver,
            11 => ItemClass::Quest,
            12 => ItemClass::Key,
            13 => ItemClass::Permanent,
            15 => ItemClass::Miscellaneous,
            16 => ItemClass::Glyph,
            _ => ItemClass::Custom(value),
        }
    }
}

#[repr(u8)]
#[derive(Serialize, Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Rarity {
    Common = 0,
    Uncommon = 1,
    Rare = 2,
    Epic = 3,
    Legendary = 4,
    Custom(i32),
}

impl From<String> for Rarity {
    fn from(value: String) -> Self {
        match value.to_lowercase().as_str() {
            "common" => Rarity::Common,
            "uncommon" => Rarity::Uncommon,
            "rare" => Rarity::Rare,
            "epic" => Rarity::Epic,
            "legendary" => Rarity::Legendary,
            _ => Rarity::Custom(value.parse().unwrap_or(0)),
        }
    }
}

impl From<i32> for Rarity {
    fn from(value: i32) -> Self {
        match value {
            0 => Rarity::Common,
            1 => Rarity::Uncommon,
            2 => Rarity::Rare,
            3 => Rarity::Epic,
            4 => Rarity::Legendary,
            _ => Rarity::Custom(value),
        }
    }
}

#[derive(Deserialize, Clone, Debug)]
pub struct PartialItemData {
    pub name: String,
    #[serde(rename = "type")]
    pub rarity_type: Option<String>,
    pub stats: Option<Vec<String>>,
    pub spells: Option<Vec<String>>,
    pub requires_level: Option<u32>,
    pub requires: Option<Vec<String>>,
    pub damage: Option<String>,
    pub added_damage: Option<String>,
    pub armor: Option<String>,
    pub speed: Option<String>,
    pub dps: Option<String>,
    pub bonding: Option<String>,
    pub hands: Option<String>,
}

pub type DataminedBeta3Map = HashMap<String, PartialItemData>;
