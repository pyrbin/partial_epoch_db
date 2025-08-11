import { useState, useEffect, useCallback } from "react";
import { VariableSizeGrid as Grid } from "react-window";
import { Item } from "@/types/item";
import ItemTooltip from "./ItemTooltip";

interface VirtualizedItemGridProps {
  items: Item[];
}

interface GridItemData {
  items: Item[];
  columnCount: number;
  itemWidth: number;
  itemHeight: number;
}

interface CellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: GridItemData;
}

// Grid cell component
function Cell({ columnIndex, rowIndex, style, data }: CellProps) {
  const { items, columnCount, itemWidth, itemHeight } = data;
  const itemIndex = rowIndex * columnCount + columnIndex;

  if (itemIndex >= items.length) {
    return <div style={style} />;
  }

  const item = items[itemIndex];
  return (
    <div style={style}>
      <div
        className="p-2 h-full flex justify-center items-center"
        style={{
          width: itemWidth,
          height: itemHeight,
          paddingTop: "8px",
          paddingBottom: "8px",
        }}
      >
        <ItemTooltip item={item} />
      </div>
    </div>
  );
}

export default function VirtualizedItemGrid({
  items,
}: VirtualizedItemGridProps) {
  const [dimensions, setDimensions] = useState({
    width: 1750, // 5 * 350px
    height: 900,
    columnCount: 5,
    itemWidth: 350,
    itemHeight: 420 + 16, // 350px + 16px padding
  });

  // Calculate grid dimensions based on screen size
  const calculateDimensions = useCallback(() => {
    const maxContainerWidth = 5 * 350; // Max 5 items wide (350px each)
    const availableWidth = window.innerWidth - 64; // Screen width minus padding
    const itemWidth = 350; // Fixed width for 350px tooltips
    const itemHeight = 420 + 16; // Fixed height for 350px tooltips + 16px padding

    // Calculate how many columns we can fit, max 5
    let columnCount = Math.floor(availableWidth / itemWidth);
    columnCount = Math.max(1, Math.min(5, columnCount));

    // Use either available width or max width, whichever is smaller
    const containerWidth = Math.min(columnCount * itemWidth, maxContainerWidth);

    // Grid height should be at least 60vh
    const containerHeight = Math.max(window.innerHeight * 0.7, 400);

    setDimensions({
      width: containerWidth,
      height: containerHeight,
      columnCount,
      itemWidth,
      itemHeight,
    });
  }, []);

  // Update dimensions on mount and resize
  useEffect(() => {
    calculateDimensions();

    const handleResize = () => {
      calculateDimensions();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateDimensions]);

  // Calculate row count
  const rowCount = Math.ceil(items.length / dimensions.columnCount);

  // Grid data
  const gridData: GridItemData = {
    items,
    columnCount: dimensions.columnCount,
    itemWidth: dimensions.itemWidth,
    itemHeight: dimensions.itemHeight,
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center py-20 text-gray-400"
        style={{ height: dimensions.height }}
      >
        <svg
          className="w-16 h-16 mb-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-.919-6.132-2.414M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <h3 className="text-lg font-medium mb-2">No items found</h3>
        <p className="text-sm">
          Try adjusting your search or filters to find items.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center pt-2 px-4 border-t-1 border-b-1 border-tooltip-border font-main">
      <div className="max-w-[1750px]">
        <Grid
          columnCount={dimensions.columnCount}
          columnWidth={() => dimensions.itemWidth}
          height={dimensions.height}
          rowCount={rowCount}
          rowHeight={() => dimensions.itemHeight}
          width={dimensions.width}
          itemData={gridData}
          style={{
            overflowX: "hidden",
          }}
        >
          {Cell}
        </Grid>
      </div>
    </div>
  );
}
