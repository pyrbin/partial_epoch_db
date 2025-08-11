import { Item } from '@/types/item';

export type ItemSizeCategory = 'small' | 'medium' | 'large' | 'xlarge';

export interface ItemSizeInfo {
  category: ItemSizeCategory;
  estimatedHeight: number;
}

// Height constants for each category
export const ITEM_HEIGHTS: Record<ItemSizeCategory, number> = {
  small: 140,    // Basic items with minimal info
  medium: 180,   // Items with some stats or basic set info
  large: 240,    // Items with multiple stats, spells, or set bonuses
  xlarge: 320,   // Complex items with extensive set information
};

/**
 * Analyzes an item's content complexity and returns appropriate size category
 */
export function categorizeItemSize(item: Item): ItemSizeInfo {
  let complexityScore = 0;

  // Base complexity for having a name
  if (item.name !== '<unknown>') {
    complexityScore += 1;
  }

  // Combat stats add complexity
  if (item.damage) complexityScore += 1;
  if (item.dps) complexityScore += 1;
  if (item.armor) complexityScore += 1;
  if (item.speed) complexityScore += 1;

  // Bonding info
  if (item.bonding) complexityScore += 1;

  // Class/subclass information
  if (item.inventory_type && item.inventory_type !== 'None') complexityScore += 1;
  if (typeof item.class === 'string' && item.class !== 'Container') complexityScore += 1;
  if (item.subclass) complexityScore += 1;

  // Stats array (each stat adds complexity)
  const validStats = item.stats.filter(stat => stat && stat.trim() !== '');
  complexityScore += validStats.length * 0.8;

  // Spells/effects array (each spell adds significant complexity)
  const validSpells = item.spells.filter(spell => spell && spell.trim() !== '');
  complexityScore += validSpells.length * 1.2;

  // Requirements
  if (item.required_level > 0) complexityScore += 0.5;
  if (item.requires.length > 0) complexityScore += item.requires.length * 0.5;

  // Set information adds significant complexity
  if (item.set) {
    complexityScore += 2; // Base for having a set
    complexityScore += item.set.spells.length * 1.5; // Each set bonus adds complexity
  }

  // Determine category based on complexity score
  let category: ItemSizeCategory;
  
  if (complexityScore <= 3) {
    category = 'small';
  } else if (complexityScore <= 7) {
    category = 'medium'; 
  } else if (complexityScore <= 12) {
    category = 'large';
  } else {
    category = 'xlarge';
  }

  return {
    category,
    estimatedHeight: ITEM_HEIGHTS[category],
  };
}

/**
 * Calculates the height needed for a row of items in the grid
 */
export function calculateRowHeight(items: Item[], startIndex: number, columnCount: number): number {
  let maxHeight = ITEM_HEIGHTS.small;
  
  for (let i = 0; i < columnCount; i++) {
    const itemIndex = startIndex + i;
    if (itemIndex < items.length) {
      const item = items[itemIndex];
      const sizeInfo = categorizeItemSize(item);
      maxHeight = Math.max(maxHeight, sizeInfo.estimatedHeight);
    }
  }
  
  return maxHeight + 32; // Add more padding for spacing and prevent overlaps
}

/**
 * Pre-calculates size categories for all items for performance
 */
export function preCalculateItemSizes(items: Item[]): Map<number, ItemSizeInfo> {
  const sizeMap = new Map<number, ItemSizeInfo>();
  
  items.forEach(item => {
    sizeMap.set(item.id, categorizeItemSize(item));
  });
  
  return sizeMap;
}