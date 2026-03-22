"use client";

import { cn } from "@/lib/utils";
import { createContext, useContext } from "react";

type PageHeaderSize = "default" | "sm";

const PageHeaderContext = createContext<{ size: PageHeaderSize }>({
  size: "default",
});

function PageHeader({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: PageHeaderSize }) {
  return (
    <PageHeaderContext.Provider value={{ size }}>
      <div
        data-slot="page-header"
        className={cn("flex w-full items-center justify-between", className)}
        {...props}
      />
    </PageHeaderContext.Provider>
  );
}

function PageHeaderContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-content"
      className={cn(
        "flex flex-col items-start gap-1.5 **:data-[role='back-button']:mb-2.5",
        className,
      )}
      {...props}
    />
  );
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<"h2">) {
  const { size } = useContext(PageHeaderContext);
  return (
    <h2
      data-slot="page-header-title"
      className={cn(
        "font-sans text-3xl font-semibold tracking-tight",
        {
          "text-xl": size === "sm",
        },
        className,
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-header-description"
      className={cn("text-muted-foreground text-xs uppercase", className)}
      {...props}
    />
  );
}

function PageHeaderActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

export {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
};
