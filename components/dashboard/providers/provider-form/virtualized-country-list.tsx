"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useImperativeHandle, useRef } from "react";
import { ComboboxItem, ComboboxList } from "@/components/ui/combobox";

type CountryItem = { id: number; code: string; name: string };

export type CountryVirtualizer = ReturnType<
  typeof useVirtualizer<HTMLDivElement, Element>
>;

interface VirtualizedCountryListProps {
  virtualizerRef: React.RefObject<CountryVirtualizer | null>;
}

export function VirtualizedCountryList({
  virtualizerRef,
}: VirtualizedCountryListProps) {
  const filteredItems = ComboboxPrimitive.useFilteredItems<CountryItem>();
  const scrollElementRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 32,
    overscan: 8,
    scrollPaddingEnd: 4,
    scrollPaddingStart: 4,
    paddingStart: 4,
    paddingEnd: 4,
    gap: 4,
  });

  useImperativeHandle(virtualizerRef, () => virtualizer);

  const handleScrollElementRef = useCallback(
    (element: HTMLDivElement | null) => {
      scrollElementRef.current = element;
      if (element) virtualizer.measure();
    },
    [virtualizer],
  );

  const totalSize = virtualizer.getTotalSize();

  if (!filteredItems.length) return null;

  return (
    <ComboboxList
      role="presentation"
      ref={handleScrollElementRef}
      className="h-[min(18rem,var(--total-size))] py-0"
      style={{ "--total-size": `${totalSize}px` } as React.CSSProperties}
    >
      <div
        role="presentation"
        className="relative w-full"
        style={{ height: totalSize }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = filteredItems[virtualItem.index];
          if (!item) return null;

          return (
            <ComboboxItem
              key={virtualItem.key}
              index={virtualItem.index}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              value={item}
              aria-setsize={filteredItems.length}
              aria-posinset={virtualItem.index + 1}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {item.name}
            </ComboboxItem>
          );
        })}
      </div>
    </ComboboxList>
  );
}
