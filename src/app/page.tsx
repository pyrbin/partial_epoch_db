"use client";

import { useState, useEffect, useMemo } from "react";
import MiniSearch from "minisearch";
import { Item, SearchFilters } from "@/types/item";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import VirtualizedItemGrid from "@/components/VirtualizedItemGrid";
import Image from "next/image";
import { getApiPath, getAssetPath } from "@/utils/paths";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    has_icon: true,
    has_name: true,
  });
  const [miniSearch, setMiniSearch] = useState<MiniSearch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data and initialize search
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load items data
        const itemsResponse = await fetch(getApiPath("/data.json"));
        const itemsData: Item[] = await itemsResponse.json();
        setItems(itemsData);

        // @ts-expect-error -- override global
        window.__EPOCH_DB = itemsData;
        console.log("Loaded items from " + getApiPath("/data.json"));

        // Initialize MiniSearch - let's create it from the items data instead
        const ms = new MiniSearch({
          fields: [
            "id",
            "name",
            "inventory_type",
            "set",
            "set.name",
            "*(set.spells)",
            "required_level",
            "*(stats)",
            "*(spells)",
            "*(requires)",
            "hands",
          ],
          storeFields: ["id"],
          extractField: (document, fieldName) => {
            if (fieldName.startsWith("*(") && fieldName.endsWith(")")) {
              const field = fieldName.slice(2, -1).split(".");
              const value = field.reduce(
                (doc, key) => doc && doc[key],
                document,
              );
              if (Array.isArray(value)) {
                const t = JSON.stringify(value);
                return t;
              }
            }

            return fieldName
              .split(".")
              .reduce((doc, key) => doc && doc[key], document);
          },
        });

        // Add documents to the search index
        const searchableItems = itemsData.map((item) => ({
          id: item.id,
          name: item.name,
          class: typeof item.class === "string" ? item.class : "Custom",
          subclass: item.subclass,
          rarity: item.rarity,
          inventory_type: item.inventory_type,
          required_level: item.required_level,
          set: item.set,
        }));

        ms.addAll(searchableItems);
        setMiniSearch(ms);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and search items
  const filteredItems = useMemo(() => {
    // Don't process if items haven't loaded yet
    if (items.length === 0) {
      return [];
    }

    let results = items;

    // Check if any filters or search are active
    const hasActiveSearch = searchQuery.trim() !== "";
    const hasActiveFilters = Object.values(filters).some(
      (value) => value !== undefined && value !== "",
    );

    // If no search or filters, show all items
    if (!hasActiveSearch && !hasActiveFilters) {
      return items;
    }

    // Apply text search
    if (hasActiveSearch && miniSearch) {
      const searchResults = miniSearch.search(searchQuery, {
        fuzzy: 0.2,
        prefix: true,
        boost: { name: 2 },
      });
      const searchIds = new Set(searchResults.map((r) => r.id));
      results = results.filter((item) => searchIds.has(item.id));
    }

    // Apply filters
    if (filters.class) {
      results = results.filter((item) => {
        const itemClass =
          typeof item.class === "string" ? item.class : "Custom";
        return itemClass === filters.class;
      });
    }

    if (filters.subclass) {
      results = results.filter((item) => item.subclass === filters.subclass);
    }

    if (filters.rarity) {
      results = results.filter((item) => item.rarity === filters.rarity);
    }

    if (filters.inventory_type) {
      results = results.filter(
        (item) => item.inventory_type === filters.inventory_type,
      );
    }

    if (filters.required_level_min !== undefined) {
      results = results.filter(
        (item) => item.required_level >= filters.required_level_min!,
      );
    }

    if (filters.required_level_max !== undefined) {
      results = results.filter(
        (item) => item.required_level <= filters.required_level_max!,
      );
    }

    if (filters.has_set) {
      results = results.filter((item) => item.set !== null);
    }

    if (filters.has_name === true) {
      results = results.filter((item) => item.name !== "<unknown>");
    }

    if (filters.has_icon === true) {
      results = results.filter(
        (item) => item.inventory_icon && item.inventory_icon.trim() !== "",
      );
    }

    if (filters.has_spells) {
      results = results.filter(
        (item) => item.spells !== null && item.spells.length > 0,
      );
    }

    return results;
  }, [items, searchQuery, filters, miniSearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center font-mono justify-center">
        <div className="text-lg flex flex-row gap-2">
          <span>Loading items database... </span>
          <Image
            src={getAssetPath("/peon.webp")}
            alt="Logo"
            width={32}
            className="animate-spin duration-200"
            height={32}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Banner */}
      <header className=" text-main pt-4 px-2 shadow-lg scale-90 relative">
        {/* GitHub Link */}
        <a 
          href="https://github.com/pyrbin/partial_epoch_db" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors duration-200"
          aria-label="View source on GitHub"
        >
          <svg 
            className="w-6 h-6" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <div className="max-w-7xl mx-auto font-mono">
          <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            PARTIAL
            <Image
              src="https://www.project-epoch.net/img/global/full-logo.webp"
              alt="Logo"
              width={200}
              height={32}
            />
            DB
            <p className="text-center text-tooltip-requirement tracking-wide ml-2 text-sm font-mono italic">
              Build 3466 (08.08.2025)
            </p>
          </h1>
          <div className="flex flex-row items-center justify-center gap-3">
            <p className="text-center text-blue-100 mt-2 font-mono">
              tot. {items.length}{" "}
              <span className="text-tooltip-requirement italic">*NEW*</span>{" "}
              items
            </p>
            <span>-</span>
            <p className="text-center text-green-400 mt-2 font-mono relative">
              from .dbc files & beta 3.5
            </p>
            <Image
              src={getAssetPath("/peon.webp")}
              alt="Logo"
              width={32}
              height={32}
            />
          </div>
        </div>
        <span className="text-center text-xs flex items-center justify-center text-gray-500 mt-2 font-mono">
          not officially affiliated with Project Epoch.
        </span>
      </header>

      {/* Search and Filter Section */}
      <div className="max-w-7xl z-[100] relative mx-auto p-2 space-y-2 scale-90">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <FilterBar
          items={items}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Results Grid */}
      <div className="mx-auto">
        <div className="max-w-7xl font-mono mx-auto mb-2 text-xs text-gray-400 text-center">
          Showing {filteredItems.length} items
        </div>
        <VirtualizedItemGrid items={filteredItems} />
      </div>
    </div>
  );
}
