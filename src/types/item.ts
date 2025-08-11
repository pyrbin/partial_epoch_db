export interface ItemSpell {
  0: number;
  1: string;
}

export interface ItemSet {
  name: string;
  id: number;
  spells: ItemSpell[];
}

export interface Item {
  id: number;
  name: string;
  class: string | { [key: string]: number };
  subclass: string;
  inventory_icon: string;
  inventory_type: string;
  set: ItemSet | null;
  required_level: number;
  stats: string[];
  spells: string[];
  requires: string[];
  rarity: string;
  damage: string;
  added_damage: string;
  armor: string;
  speed: string;
  dps: string;
  bonding: string;
  hands: string;
}

export interface SearchFilters {
  class?: string;
  subclass?: string;
  rarity?: string;
  inventory_type?: string;
  required_level_min?: number;
  required_level_max?: number;
  has_set?: boolean;
  has_name?: boolean;
  has_icon?: boolean;
  has_spells?: boolean;
}
