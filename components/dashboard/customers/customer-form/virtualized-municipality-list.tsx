"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Municipality } from "factus-js";
import { useCallback, useImperativeHandle, useRef } from "react";
import { ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

export type MunicipalityVirtualizer = ReturnType<
  typeof useVirtualizer<HTMLDivElement, Element>
>;

interface VirtualizedMunicipalityListProps {
  virtualizerRef: React.RefObject<MunicipalityVirtualizer | null>;
}

export function VirtualizedMunicipalityList({
  virtualizerRef,
}: VirtualizedMunicipalityListProps) {
  const filteredItems = ComboboxPrimitive.useFilteredItems<Municipality>();
  const scrollElementRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 52,
    overscan: 8,
    scrollPaddingEnd: 4,
    scrollPaddingStart: 4,
    paddingStart: 4,
    paddingEnd: 4,
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
      className="h-[min(22rem,var(--total-size))] py-0"
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
              <Item size="xs" className="h-[52px] p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {item.name}
                  </ItemTitle>
                  <ItemDescription>{item.department}</ItemDescription>
                </ItemContent>
              </Item>
            </ComboboxItem>
          );
        })}
      </div>
    </ComboboxList>
  );
}
