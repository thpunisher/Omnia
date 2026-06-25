import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "@/shared/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { SearchIcon } from "lucide-react"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn("flex size-full flex-col overflow-hidden rounded-xl", className)}
      style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Search",
  description = "Search across your workspace",
  children,
  className,
  showCloseButton = false,
  shouldFilter,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  shouldFilter?: boolean
  children: React.ReactNode
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("top-[20%] translate-y-0 overflow-hidden p-0 shadow-2xl", className)}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          maxWidth: "560px",
          width: "calc(100vw - 2rem)",
        }}
        showCloseButton={showCloseButton}
      >
        <Command shouldFilter={shouldFilter}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <SearchIcon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }} />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex-1 text-sm outline-none bg-transparent placeholder:text-[var(--color-text-tertiary)]",
          className
        )}
        style={{ color: "var(--color-text-primary)" }}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("max-h-[420px] overflow-y-auto overflow-x-hidden p-1", className)}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-8 text-center text-sm", className)}
      style={{ color: "var(--color-text-tertiary)" }}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn("overflow-hidden p-1", className)}
      style={{
        "--cmdk-group-heading-color": "var(--color-text-tertiary)",
      } as React.CSSProperties}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("my-1 h-px", className)}
      style={{ background: "var(--color-border)" }}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm outline-none select-none",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
        "data-selected:bg-white/[0.06]",
        className
      )}
      style={{ color: "var(--color-text-primary)" }}
      {...props}
    >
      {children}
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("ml-auto text-xs tracking-widest", className)}
      style={{ color: "var(--color-text-tertiary)" }}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
