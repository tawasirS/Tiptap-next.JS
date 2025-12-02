'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
    useEditor,
    EditorContent,
    Editor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';

// ---- Image แบบ custom ที่มี width (%)
const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: 60, // เริ่มต้น 60%
                parseHTML: (element) =>
                    Number(element.getAttribute('data-width') || 60),
                renderHTML: (attributes) => {
                    const width = attributes.width || 60;
                    return {
                        'data-width': width,
                        style: `width: ${width}%;`,
                    };
                },
            },
        };
    },
});

interface TiptapProps {
    initialContent: string;
    onChange: (content: string) => void;
}

const ToolbarButton: React.FC<{
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ active, disabled, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={[
            'px-2 py-1 text-xs rounded-md border border-transparent',
            'hover:bg-gray-100',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            active ? 'bg-gray-200 font-semibold' : '',
        ].join(' ')}
    >
        {children}
    </button>
);

const MenuBar: React.FC<{ editor: Editor | null }> = ({ editor }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [imageWidth, setImageWidth] = useState(60);

    if (!editor) return null;

    // sync width ตอนเปลี่ยน selection
    useEffect(() => {
        const updateWidth = () => {
            if (!editor.isActive('image')) return;
            const attrs = editor.getAttributes('image');
            if (attrs?.width) {
                setImageWidth(Number(attrs.width));
            }
        };

        editor.on('selectionUpdate', updateWidth);
        editor.on('transaction', updateWidth);

        return () => {
            editor.off('selectionUpdate', updateWidth);
            editor.off('transaction', updateWidth);
        };
    }, [editor]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editor) return;

        const reader = new FileReader();

        reader.onload = () => {
            const base64 = reader.result as string;

            // แทรกรูปเป็น base64 + width 60%
            editor
                .chain()
                .focus()
                .setImage({ src: base64, width: 60 })
                .run();
        };

        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const handleWidthSlider = (value: number) => {
        setImageWidth(value);
        editor
            .chain()
            .focus()
            .updateAttributes('image', { width: value }) // ✅ ใช้ updateAttributes แทน
            .run();
    };

    const isImageSelected = editor.isActive('image');

    return (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm">
            {/* block styles */}
            <ToolbarButton
                active={editor.isActive('paragraph')}
                onClick={() => editor.chain().focus().setParagraph().run()}
            >
                Text
            </ToolbarButton>
            {[1, 2, 3].map((level) => (
                <ToolbarButton
                    key={level}
                    active={editor.isActive('heading', { level })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level }).run()
                    }
                >
                    H{level}
                </ToolbarButton>
            ))}

            <span className="mx-1 h-4 w-px bg-gray-300" />

            {/* inline styles */}
            <ToolbarButton
                active={editor.isActive('bold')}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                Bold
            </ToolbarButton>
            <ToolbarButton
                active={editor.isActive('italic')}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                Italic
            </ToolbarButton>
            <ToolbarButton
                active={editor.isActive('underline')}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                Underline
            </ToolbarButton>
            <ToolbarButton
                active={editor.isActive('strike')}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                Strike
            </ToolbarButton>
            <ToolbarButton
                active={editor.isActive('code')}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                Code
            </ToolbarButton>

            <span className="mx-1 h-4 w-px bg-gray-300" />

            {/* lists & tasks */}
            <ToolbarButton
                active={editor.isActive('bulletList')}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                • List
            </ToolbarButton>
            <ToolbarButton
                active={editor.isActive('orderedList')}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                1. List
            </ToolbarButton>
            <ToolbarButton
                active={editor.isActive('taskList')}
                onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
                ☑ Tasks
            </ToolbarButton>

            <span className="mx-1 h-4 w-px bg-gray-300" />

            {/* blocks */}
            <ToolbarButton
                active={editor.isActive('blockquote')}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
                Quote
            </ToolbarButton>
            <ToolbarButton
                active={editor.isActive('codeBlock')}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
                Code block
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                Divider
            </ToolbarButton>

            <span className="mx-1 h-4 w-px bg-gray-300" />

            {/* Image upload */}
            <ToolbarButton onClick={() => fileInputRef.current?.click()}>
                🖼 Image
            </ToolbarButton>
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
            />

            {/* ถ้าเลือกที่รูปอยู่ ให้โชว์ slider ย่อ/ขยาย */}
            {isImageSelected && (
                <div className="ml-4 flex items-center gap-2 text-xs text-gray-600">
                    <span>Size</span>
                    <input
                        type="range"
                        min={20}
                        max={100}
                        step={5}
                        value={imageWidth}
                        onChange={(e) => handleWidthSlider(Number(e.target.value))}
                    />
                    <span>{imageWidth}%</span>
                </div>
            )}

            <span className="mx-1 h-4 w-px bg-gray-300" />

            {/* undo / redo */}
            <ToolbarButton
                disabled={!editor.can().chain().focus().undo().run()}
                onClick={() => editor.chain().focus().undo().run()}
            >
                Undo
            </ToolbarButton>
            <ToolbarButton
                disabled={!editor.can().chain().focus().redo().run()}
                onClick={() => editor.chain().focus().redo().run()}
            >
                Redo
            </ToolbarButton>
        </div>
    );
};

const TiptapEditor: React.FC<TiptapProps> = ({ initialContent, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: 'เขียนอะไรบางอย่างแบบ Notion เลย...',
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),
            ResizableImage.configure({
                inline: false,
                allowBase64: true,
            }),
        ],
        content: initialContent,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    'tiptap prose prose-neutral max-w-none px-6 py-4 outline-none min-h-[220px]',
            },
        },
    });

    if (!editor) return null;

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            DOCUMENT
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                            Notion-like Editor
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Editing
                    </div>
                </div>

                {/* Toolbar */}
                <MenuBar editor={editor} />

                {/* Content */}
                <div className="bg-white">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Preview HTML */}
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                <div className="mb-1 font-semibold text-gray-700">HTML output</div>
                <pre className="whitespace-pre-wrap break-words">
                    {editor.getHTML()}
                </pre>
            </div>
        </div>
    );
};

export default TiptapEditor;
