"use client";

import { useState, useEffect, useMemo } from "react";
import MiniSearch from "minisearch";
import { Item, SearchFilters } from "@/types/item";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import VirtualizedItemGrid from "@/components/VirtualizedItemGrid";
import Image from "next/image";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [miniSearch, setMiniSearch] = useState<MiniSearch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data and initialize search
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load items data
        const itemsResponse = await fetch("/data.json");
        const itemsData: Item[] = await itemsResponse.json();
        setItems(itemsData);

        // @ts-expect-error -- override global
        window.__EPOCH_DB = itemsData;

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
                console.log(t);
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

    if (filters.has_name) {
      results = results.filter((item) => item.name !== "<unknown>");
    }

    if (filters.has_icon) {
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
          <Image src="/peon.webp" alt="Logo" width={32} height={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Banner */}
      <header className=" text-main p-6 shadow-lg">
        <div className="max-w-7xl mx-auto font-mono">
          <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            PARTIAL
            <Image
              src="https://www.project-epoch.net/img/global/full-logo.webp"
              alt="Logo"
              width={200}
              height={32}
            />
            - DB
            <p className="text-center text-tooltip-requirement tracking-wide text-sm font-mono italic">
              Build 3466
            </p>
          </h1>
          <div className="flex flex-row items-center justify-center gap-3">
            <p className="text-center text-blue-100 mt-2 font-mono">
              tot. {items.length.toLocaleString()}{" "}
              <span className="text-tooltip-requirement italic">*NEW*</span>{" "}
              items
            </p>
            <span>-</span>
            <p className="text-center text-green-400 mt-2 font-mono relative">
              from .dbc files & beta 3.5
            </p>
            <Image src="/peon.webp" alt="Logo" width={32} height={32} />
          </div>
        </div>
        <span className="text-center text-xs flex items-center justify-center text-gray-500 mt-2 font-mono">
          not officially affiliated with Project Epoch.
        </span>
      </header>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto p-4 space-y-2">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <FilterBar
          items={items}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Results Grid */}
      <div className="mx-auto p-4">
        <div className="max-w-7xl font-mono mx-auto not-target:mb-4 text-sm text-gray-400 text-center">
          Showing {filteredItems.length.toLocaleString()} items
        </div>
        <VirtualizedItemGrid items={filteredItems} />
      </div>
    </div>
  );
}
