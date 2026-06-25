import { Extension } from "@tiptap/core";
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import {
  Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare,
  Quote, Code2, Minus, Table as TableIcon, Image as ImageIcon, Type,
  Grid3X3,
} from "lucide-react";
import React, {
  forwardRef, useEffect, useImperativeHandle, useState,
} from "react";
import type { Editor, Range } from "@tiptap/core";

interface CommandItem {
  title: string;
  description: string;
  icon: React.ElementType;
  keywords: string[];
  command: (props: { editor: Editor; range: Range }) => void;
  hasSubMenu?: boolean;
}

/** Grid picker rendered inline inside the command list for table insertion */
const TablePicker = ({
  onPick, onCancel,
}: {
  onPick: (rows: number, cols: number) => void;
  onCancel: () => void;
}) => {
  const [hovered, setHovered] = useState<[number, number]>([0, 0]);
  const MAX = 8;
  return (
    <div className="p-3">
      <p className="text-[0.6875rem] mb-2" style={{ color: "var(--color-text-tertiary)" }}>
        {hovered[0] > 0 ? `${hovered[0]} × ${hovered[1]} table` : "Move to select size"}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${MAX}, 20px)`, gap: "3px" }}>
        {Array.from({ length: MAX }).map((_, row) =>
          Array.from({ length: MAX }).map((_, col) => (
            <div
              key={`${row}-${col}`}
              onMouseEnter={() => setHovered([row + 1, col + 1])}
              onMouseLeave={() => setHovered([0, 0])}
              onClick={() => onPick(row + 1, col + 1)}
              style={{
                width: 20, height: 20,
                borderRadius: 3,
                cursor: "pointer",
                background:
                  row < hovered[0] && col < hovered[1]
                    ? "var(--color-accent)"
                    : "var(--color-border)",
                transition: "background 80ms",
              }}
            />
          ))
        )}
      </div>
      <button
        onClick={onCancel}
        className="mt-3 text-xs btn-ghost"
        style={{ padding: "0.2rem 0.5rem" }}
      >
        Cancel
      </button>
    </div>
  );
};

const makeItems = (): CommandItem[] => [
  {
    title: "Text", description: "Just start writing", icon: Type, keywords: ["paragraph", "text"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1", description: "Big section heading", icon: Heading1, keywords: ["h1", "title"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    title: "Heading 2", description: "Medium section heading", icon: Heading2, keywords: ["h2", "subtitle"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Heading 3", description: "Small section heading", icon: Heading3, keywords: ["h3"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Bullet list", description: "Unordered list", icon: List, keywords: ["ul", "bullet"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered list", description: "Ordered list with numbers", icon: ListOrdered, keywords: ["ol", "ordered"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "To-do list", description: "Checkbox task list", icon: CheckSquare, keywords: ["todo", "task", "checkbox"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Table", description: "Pick rows & columns", icon: TableIcon, keywords: ["table", "grid"],
    hasSubMenu: true,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: "Image", description: "Embed image by URL or paste", icon: ImageIcon, keywords: ["image", "picture"],
    command: ({ editor, range }) => {
      const url = window.prompt("Paste an image URL:");
      if (url) editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
      else editor.chain().focus().deleteRange(range).run();
    },
  },
  {
    title: "Quote", description: "Capture a quote", icon: Quote, keywords: ["blockquote", "quote"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code block", description: "Syntax-highlighted code", icon: Code2, keywords: ["code", "snippet"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Divider", description: "Section separator", icon: Minus, keywords: ["divider", "hr", "line"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

const CommandList = forwardRef<
  unknown,
  {
    items: CommandItem[];
    command: (item: CommandItem) => void;
    editorRef?: { editor: Editor; range: Range } | null;
  }
>(({ items, command, editorRef }, ref) => {
  const [selected, setSelected] = useState(0);
  const [tablePickerFor, setTablePickerFor] = useState<CommandItem | null>(null);

  useEffect(() => setSelected(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (tablePickerFor) {
        if (event.key === "Escape") { setTablePickerFor(null); return true; }
        return false;
      }
      if (event.key === "ArrowUp") { setSelected((s) => (s + items.length - 1) % items.length); return true; }
      if (event.key === "ArrowDown") { setSelected((s) => (s + 1) % items.length); return true; }
      if (event.key === "Enter") {
        const item = items[selected];
        if (!item) return false;
        if (item.hasSubMenu) { setTablePickerFor(item); return true; }
        command(item);
        return true;
      }
      return false;
    },
  }));

  if (tablePickerFor && editorRef) {
    return (
      <TablePicker
        onPick={(rows, cols) => {
          editorRef.editor.chain().focus().deleteRange(editorRef.range).insertTable({ rows, cols, withHeaderRow: true }).run();
          setTablePickerFor(null);
        }}
        onCancel={() => setTablePickerFor(null)}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-3 py-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        No matching blocks
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden py-1 w-64 max-h-80 overflow-y-auto shadow-2xl"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            onClick={() => {
              if (item.hasSubMenu) { setTablePickerFor(item); return; }
              command(item);
            }}
            onMouseEnter={() => setSelected(i)}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left transition-colors"
            style={{ background: i === selected ? "var(--color-accent-dim)" : "transparent" }}
          >
            <div
              className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--color-overlay)", border: "1px solid var(--color-border)" }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: "var(--color-text-secondary)" }} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate flex items-center gap-1.5" style={{ color: "var(--color-text-primary)" }}>
                {item.title}
                {item.hasSubMenu && <Grid3X3 className="w-3 h-3 opacity-50" />}
              </div>
              <div className="text-[0.6875rem] truncate" style={{ color: "var(--color-text-tertiary)" }}>
                {item.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
});

CommandList.displayName = "CommandList";

const suggestion: Omit<SuggestionOptions<CommandItem>, "editor"> = {
  char: "/",
  startOfLine: false,
  items: ({ query }) => {
    const q = query.toLowerCase();
    const all = makeItems();
    if (!q) return all;
    return all.filter(
      (item) => item.title.toLowerCase().includes(q) || item.keywords.some((k) => k.includes(q))
    );
  },
  render: () => {
    let component: ReactRenderer;
    let popup: TippyInstance[];
    let editorAndRange: { editor: Editor; range: Range } | null = null;

    return {
      onStart: (props) => {
        editorAndRange = { editor: props.editor, range: props.range };
        component = new ReactRenderer(CommandList, {
          props: {
            items: props.items,
            command: (item: CommandItem) => props.command(item),
            editorRef: editorAndRange,
          },
          editor: props.editor,
        });
        if (!props.clientRect) return;
        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },
      onUpdate: (props) => {
        editorAndRange = { editor: props.editor, range: props.range };
        component.updateProps({
          items: props.items,
          command: (item: CommandItem) => props.command(item),
          editorRef: editorAndRange,
        });
        if (!props.clientRect) return;
        popup[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
      },
      onKeyDown: (props) => {
        if (props.event.key === "Escape") { popup[0]?.hide(); return true; }
        return (component.ref as { onKeyDown: (p: unknown) => boolean })?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },
};

export const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() { return { suggestion }; },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: CommandItem }) => {
          props.command({ editor, range });
        },
      }),
    ];
  },
});
