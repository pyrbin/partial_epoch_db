import { useMemo, useState } from "react";
import { Item, SearchFilters } from "@/types/item";

interface FilterBarProps {
  items: Item[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

interface FilterDropdownProps {
  label: string;
  value: string | undefined;
  options: string[];
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
  isOpen,
  onToggle,
}: FilterDropdownProps) {

  const handleSelect = (option: string | undefined) => {
    onChange(option);
    onToggle(); // Close this dropdown
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        <span className="font-medium text-gray-300">{label}:</span>
        <span className="text-gray-100">{value || placeholder}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
          <div className="py-1">
            <button
              onClick={() => handleSelect(undefined)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-700 ${
                !value ? "bg-blue-900 text-blue-300" : "text-gray-100"
              }`}
            >
              {placeholder}
            </button>
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-700 ${
                  value === option
                    ? "bg-blue-900 text-blue-300"
                    : "text-gray-100"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FilterBar({
  items,
  filters,
  onFiltersChange,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const classes = new Set<string>();
    const subclasses = new Set<string>();
    const rarityOrder = [
      "All",
      "Poor",
      "Common",
      "Uncommon",
      "Rare",
      "Epic",
      "Legendary",
    ];

    const rarities = new Set<string>();
    const inventoryTypes = new Set<string>();

    items.forEach((item) => {
      // Handle class (can be string or object)
      if (typeof item.class === "string") {
        classes.add(item.class);
      } else {
        classes.add("Custom");
      }

      if (item.subclass) subclasses.add(item.subclass);
      if (item.rarity) rarities.add(item.rarity);
      if (item.inventory_type && item.inventory_type !== "None") {
        inventoryTypes.add(item.inventory_type);
      }
    });

    return {
      classes: Array.from(classes).sort(),
      subclasses: Array.from(subclasses).sort(),
      rarities: Array.from(rarities).sort(
        (a, b) => rarityOrder.indexOf(a) - rarityOrder.indexOf(b),
      ),
      inventoryTypes: Array.from(inventoryTypes).sort(),
    };
  }, [items]);

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | boolean | undefined,
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleLevelChange = (type: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : parseInt(value, 10);
    if (type === "min") {
      onFiltersChange({
        ...filters,
        required_level_min: numValue,
      });
    } else {
      onFiltersChange({
        ...filters,
        required_level_max: numValue,
      });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "",
  );

  const handleDropdownToggle = (dropdownKey: string) => {
    setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey);
  };

  return (
    <div className="space-y-4">
      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-2 flex-col">
        <div className="flex flex-wrap gap-2 flex-row">
          {/* Level Range Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">Level:</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.required_level_min ?? ""}
              onChange={(e) => handleLevelChange("min", e.target.value)}
              className="w-16 px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              min="1"
              max="80"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.required_level_max ?? ""}
              onChange={(e) => handleLevelChange("max", e.target.value)}
              className="w-16 px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              min="1"
              max="80"
            />
          </div>

          <FilterDropdown
            label="Class"
            value={filters.class}
            options={filterOptions.classes}
            onChange={(value) => handleFilterChange("class", value)}
            isOpen={openDropdown === "class"}
            onToggle={() => handleDropdownToggle("class")}
          />

          <FilterDropdown
            label="Subclass"
            value={filters.subclass}
            options={filterOptions.subclasses}
            onChange={(value) => handleFilterChange("subclass", value)}
            isOpen={openDropdown === "subclass"}
            onToggle={() => handleDropdownToggle("subclass")}
          />

          <FilterDropdown
            label="Rarity"
            value={filters.rarity}
            options={filterOptions.rarities}
            onChange={(value) => handleFilterChange("rarity", value)}
            isOpen={openDropdown === "rarity"}
            onToggle={() => handleDropdownToggle("rarity")}
          />

          <FilterDropdown
            label="Slot"
            value={filters.inventory_type}
            options={filterOptions.inventoryTypes}
            onChange={(value) => handleFilterChange("inventory_type", value)}
            isOpen={openDropdown === "inventory_type"}
            onToggle={() => handleDropdownToggle("inventory_type")}
          />
        </div>

        <div className="flex flex-wrap gap-2 flex-row h-[50px]">
          {/* Toggle Filters */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.has_set ?? false}
                onChange={(e) =>
                  handleFilterChange(
                    "has_set",
                    e.target.checked ? true : undefined,
                  )
                }
                className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-300">Has Set</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.has_name === true}
                onChange={(e) =>
                  handleFilterChange(
                    "has_name",
                    e.target.checked ? true : false,
                  )
                }
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="cursor-pointer text-sm font-medium text-gray-300">
                Has Name
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.has_icon === true}
                onChange={(e) =>
                  handleFilterChange(
                    "has_icon",
                    e.target.checked ? true : false,
                  )
                }
                className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-300">
                Has Icon
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.has_spells ?? false}
                onChange={(e) =>
                  handleFilterChange(
                    "has_spells",
                    e.target.checked ? true : undefined,
                  )
                }
                className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-300">
                Has Spells
              </span>
            </label>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 cursor-pointer text-base font-bold text-red-400 hover:text-red-300 underline focus:outline-none"
            >
              ❌ Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
