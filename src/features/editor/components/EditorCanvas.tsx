import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table/table";
import { TableRow } from "@tiptap/extension-table/row";
import { TableHeader } from "@tiptap/extension-table/header";
import { TableCell } from "@tiptap/extension-table/cell";
import { SlashCommand } from "../extensions/SlashCommand";
import { EditorToolbar } from "./EditorToolbar";

interface EditorCanvasProps {
  /** Called with serialized HTML content on change (debounced upstream by the caller). */
  onChange?: (html: string) => void;
  initialContent?: string | null;
}

export const EditorCanvas = ({ onChange, initialContent }: EditorCanvasProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Write something, or type '/' for commands…" }),
      SlashCommand,
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: "max-w-none focus:outline-none",
      },
      // Handle pasted images (e.g. copy-paste from Notion/Finder) as base64 embeds.
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));
        if (!imageItem) return false;

        const file = imageItem.getAsFile();
        if (!file) return false;

        event.preventDefault();
        const reader = new FileReader();
        reader.onload = () => {
          const src = reader.result as string;
          const { schema } = view.state;
          const node = schema.nodes.image.create({ src });
          const tr = view.state.tr.replaceSelectionWith(node);
          view.dispatch(tr);
        };
        reader.readAsDataURL(file);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="relative">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
