"use client";

import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export interface MenuBarItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick?: () => void;
  isToggle?: boolean;
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

interface MenuBarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: MenuBarItem[];
  activeIndex?: number | null;
  title?: string;
  children?: React.ReactNode;
}

export function MenuBar({
  items,
  className,
  activeIndex: controlledActiveIndex,
  title,
  children,
  ...props
}: MenuBarProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({
    left: 0,
    width: 0,
  });
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const effectiveActiveIndex =
    controlledActiveIndex !== undefined ? controlledActiveIndex : activeIndex;

  React.useEffect(() => {
    if (
      effectiveActiveIndex !== null &&
      menuRef.current &&
      tooltipRef.current
    ) {
      const menuItem = menuRef.current.children[
        effectiveActiveIndex
      ] as HTMLElement;
      const menuRect = menuRef.current.getBoundingClientRect();
      const itemRect = menuItem.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      const left =
        itemRect.left -
        menuRect.left +
        (itemRect.width - tooltipRect.width) / 2;

      setTooltipPosition({
        left: Math.max(0, Math.min(left, menuRect.width - tooltipRect.width)),
        width: tooltipRect.width,
      });
    }
  }, [effectiveActiveIndex]);

  return (
    <div className={cn("relative", className)} {...props}>
      <AnimatePresence>
        {effectiveActiveIndex !== null && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="-bottom-[31px] pointer-events-none absolute right-0 left-0 z-50"
            exit={{ opacity: 0, y: -5 }}
            initial={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div
              animate={{ x: tooltipPosition.left }}
              className={cn(
                "inline-flex h-7 items-center justify-center overflow-hidden rounded-lg px-3",
                "bg-background/95 backdrop-blur",
                "border border-border/50",
                "shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
                "dark:border-border/50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              )}
              initial={{ x: tooltipPosition.left }}
              ref={tooltipRef}
              style={{ width: "auto" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <p className="whitespace-nowrap font-medium text-[13px] leading-tight">
                {items[effectiveActiveIndex].label}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "z-10 inline-flex h-10 items-center justify-center gap-[3px] overflow-hidden px-1",
          "rounded-lg bg-background/95 backdrop-blur",
          "border border-border/50",
          "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(0,0,0,0.1)]",
          "dark:border-border/50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_16px_-4px_rgba(0,0,0,0.2)]"
        )}
        ref={menuRef}
      >
        {title && <div className="px-3 mr-1 font-lg">12{title}</div>}
        {items.map((item, index) =>
          item.isToggle ? (
            <Toggle
              className={cn(
                "flex h-8 w-8 items-center justify-center gap-2 rounded-lg px-3 py-1",
                effectiveActiveIndex === index && "bg-muted/80"
              )}
              key={item.label}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onPressedChange={item.onPressedChange}
              pressed={item.pressed}
            >
              <div className="flex items-center justify-center">
                <div className="flex h-[18px] w-[18px] items-center justify-center overflow-hidden">
                  <item.icon className="h-full w-full" />
                </div>
              </div>
              <span className="sr-only">{item.label}</span>
            </Toggle>
          ) : (
            <button
              className={cn(
                "flex h-8 w-8 items-center justify-center gap-2 rounded-lg px-3 py-1 transition-colors hover:bg-muted/80",
                effectiveActiveIndex === index && "bg-muted/80"
              )}
              key={item.label}
              onClick={item.onClick}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              type="button"
            >
              <div className="flex items-center justify-center">
                <div className="flex h-[18px] w-[18px] items-center justify-center overflow-hidden">
                  <item.icon className="h-full w-full" />
                </div>
              </div>
              <span className="sr-only">{item.label}</span>
            </button>
          )
        )}
        {children}
      </div>
    </div>
  );
}
