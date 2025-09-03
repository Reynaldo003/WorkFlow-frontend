import React, { useRef, useState, useEffect } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import FontFamily from '@tiptap/extension-font-family'
import '../../App.css'
import {
    Bold, Italic, Strikethrough, Underline as UnderlineIcon, Code,
    List, ListOrdered, Quote, Minus, RotateCcw, RotateCw, Type,
    Link as LinkIcon, Unlink, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    IndentIncrease, IndentDecrease, PaintBucket, Image as ImageIcon
} from 'lucide-react'
/**
 * NOTA IMPORTANTE:
 * - Asegúrate de que tu layout añada la clase `dark` en <html> cuando esté en modo oscuro.
 * - Para que se “vean” los H1–H6, listas y blockquote como Word, añade el bloque CSS de abajo a tu global CSS.
 */

const extensions = [
    FontFamily,
    Color,
    TextStyle.configure(),
    Underline,
    Highlight,
    Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
    }),
    Image.configure({ allowBase64: true }),
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
        placeholder: 'Escribe aquí…',
    }),
    StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: true,
        blockquote: true,
        history: true,
    }),
]

function ToolbarButton({ active, disabled, onClick, title, children }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={[
                'inline-flex items-center gap-1 px-2.5 h-9 rounded-lg border text-sm',
                'transition-colors select-none',
                'border-transparent bg-neutral-100 hover:bg-neutral-200 text-neutral-800',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-100',
                active ? 'ring-2 ring-amber-500/60 bg-amber-100 dark:bg-amber-900/40' : '',
            ].join(' ')}
        >
            {children}
        </button>
    )
}

function ToolbarSeparator() {
    return <div className="w-px h-6 bg-neutral-300 mx-2 dark:bg-neutral-700" />
}

function HeadingSelect({ editor }) {
    const isPara = editor.isActive('paragraph')
    const levels = [1, 2, 3, 4, 5, 6]
    const current = levels.find(l => editor.isActive('heading', { level: l })) || (isPara ? 'p' : 'p')
    const setHeading = (val) => {
        const chain = editor.chain().focus()
        if (val === 'p') chain.setParagraph().run()
        else chain.setHeading({ level: Number(val) }).run()
    }
    return (
        <div className="relative">
            <select
                className="h-9 rounded-lg border bg-white/70 dark:bg-neutral-900/70 backdrop-blur
                   border-neutral-300 dark:border-neutral-700 text-sm px-8 pr-3 pl-9
                   text-neutral-800 dark:text-neutral-100"
                value={String(current)}
                onChange={(e) => setHeading(e.target.value)}
                title="Estilo de texto"
            >
                <option value="p">Párrafo</option>
                {levels.map(l => <option key={l} value={l}>{`H${l}`}</option>)}
            </select>
            <Type className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 opacity-70" />
        </div>
    )
}

function FontFamilySelect({ editor }) {
    const options = [
        'Inter, system-ui, sans-serif',
        'Georgia, serif',
        'Times New Roman, Times, serif',
        'Arial, Helvetica, sans-serif',
        'Courier New, Courier, monospace',
    ]
    const apply = (ff) => editor.chain().focus().setFontFamily(ff).run()
    return (
        <select
            className="h-9 rounded-lg border bg-white/70 dark:bg-neutral-900/70 border-neutral-300 dark:border-neutral-700 text-sm px-2 text-neutral-800 dark:text-neutral-100"
            onChange={(e) => apply(e.target.value)}
            defaultValue=""
            title="Fuente"
        >
            <option value="" disabled>Fuente</option>
            {options.map(o => <option key={o} value={o}>{o.split(',')[0]}</option>)}
        </select>
    )
}

function FontSizeSelect({ editor }) {
    // Usa TextStyle con style font-size
    const sizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']
    const apply = (size) => editor.chain().focus().setMark('textStyle', { fontSize: size }).run()
    const clear = () => editor.chain().focus().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
    return (
        <div className="flex items-center gap-1">
            <select
                className="h-9 rounded-lg border bg-white/70 dark:bg-neutral-900/70 border-neutral-300 dark:border-neutral-700 text-sm px-2 text-neutral-800 dark:text-neutral-100"
                defaultValue=""
                onChange={(e) => apply(e.target.value)}
                title="Tamaño"
            >
                <option value="" disabled>Tamaño</option>
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
                type="button"
                className="text-xs opacity-70 hover:opacity-100"
                onClick={clear}
                title="Quitar tamaño"
            >
                Reset
            </button>
        </div>
    )
}

function ColorPicker({ editor }) {
    const [color, setColor] = useState('#222222')
    const [hl, setHl] = useState('#fff59d')
    return (
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs opacity-80">
                <span>A</span>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                        setColor(e.target.value)
                        editor.chain().focus().setColor(e.target.value).run()
                    }}
                    className="w-8 h-6 p-0 bg-transparent border rounded"
                    title="Color de texto"
                />
            </label>
            <label className="flex items-center gap-1 text-xs opacity-80">
                <PaintBucket className="w-4 h-4" />
                <input
                    type="color"
                    value={hl}
                    onChange={(e) => {
                        setHl(e.target.value)
                        editor.chain().focus().setHighlight({ color: e.target.value }).run()
                    }}
                    className="w-8 h-6 p-0 bg-transparent border rounded"
                    title="Resaltado"
                />
            </label>
        </div>
    )
}

function LinkControls({ editor }) {
    const setLink = () => {
        const prev = editor.getAttributes('link').href
        const url = window.prompt('URL del enlace:', prev || 'https://')
        if (url === null) return
        if (url === '') {
            editor.chain().focus().unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    const unset = () => editor.chain().focus().unsetLink().run()
    const isActive = editor.isActive('link')
    return (
        <div className="flex items-center gap-2">
            <ToolbarButton title="Insertar/editar enlace" active={isActive} onClick={setLink}>
                <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton title="Quitar enlace" onClick={unset}>
                <Unlink className="w-4 h-4" />
            </ToolbarButton>
        </div>
    )
}

function ImageControl({ editor }) {
    const inputRef = useRef(null)
    const onPick = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            editor.chain().focus().setImage({ src: reader.result }).run()
            inputRef.current.value = ''
        }
        reader.readAsDataURL(file)
    }
    return (
        <>
            <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
            <ToolbarButton title="Insertar imagen" onClick={() => inputRef.current?.click()}>
                <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
        </>
    )
}

function MenuBar({ editor }) {
    if (!editor) return null

    const st = useEditorState({
        editor,
        selector: (ctx) => ({
            isBold: ctx.editor.isActive('bold'),
            canBold: ctx.editor.can().chain().toggleBold().run(),
            isItalic: ctx.editor.isActive('italic'),
            canItalic: ctx.editor.can().chain().toggleItalic().run(),
            isStrike: ctx.editor.isActive('strike'),
            canStrike: ctx.editor.can().chain().toggleStrike().run(),
            isUnderline: ctx.editor.isActive('underline'),
            isBulletList: ctx.editor.isActive('bulletList'),
            isOrderedList: ctx.editor.isActive('orderedList'),
            isBlockquote: ctx.editor.isActive('blockquote'),
            isCodeBlock: ctx.editor.isActive('codeBlock'),
            canUndo: ctx.editor.can().chain().undo().run(),
            canRedo: ctx.editor.can().chain().redo().run(),
            align: (['left', 'center', 'right', 'justify']).find(a => ctx.editor.isActive({ textAlign: a })) || 'left',
        }),
    })

    const setAlign = (a) => editor.chain().focus().setTextAlign(a).run()

    return (
        <div className="sticky top-0 z-20 w-full backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
            <div className="mx-auto max-w-[min(1200px,100%)] px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-thin">
                <HeadingSelect editor={editor} />
                <FontFamilySelect editor={editor} />
                <FontSizeSelect editor={editor} />
                <ToolbarSeparator />

                <ToolbarButton title="Negritas (Ctrl+B)" active={st.isBold} disabled={!st.canBold} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Cursiva (Ctrl+I)" active={st.isItalic} disabled={!st.canItalic} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Subrayado" active={st.isUnderline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                    <UnderlineIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Tachado" active={st.isStrike} disabled={!st.canStrike} onClick={() => editor.chain().focus().toggleStrike().run()}>
                    <Strikethrough className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Código en línea" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
                    <Code className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarSeparator />
                <ColorPicker editor={editor} />
                <ToolbarSeparator />

                <ToolbarButton title="Viñetas" active={st.isBulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Lista ordenada" active={st.isOrderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                {/* Indent/Outdent para listas */}
                <ToolbarButton title="Aumentar sangría (lista)" onClick={() => editor.chain().focus().sinkListItem('listItem').run()}>
                    <IndentIncrease className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Disminuir sangría (lista)" onClick={() => editor.chain().focus().liftListItem('listItem').run()}>
                    <IndentDecrease className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarSeparator />
                <ToolbarButton title="Cita" active={st.isBlockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <Quote className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Bloque de código" active={st.isCodeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                    <Code className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarSeparator />
                <ToolbarButton title="Alinear izquierda" active={st.align === 'left'} onClick={() => setAlign('left')}>
                    <AlignLeft className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Centrar" active={st.align === 'center'} onClick={() => setAlign('center')}>
                    <AlignCenter className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Alinear derecha" active={st.align === 'right'} onClick={() => setAlign('right')}>
                    <AlignRight className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Justificar" active={st.align === 'justify'} onClick={() => setAlign('justify')}>
                    <AlignJustify className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarSeparator />
                <LinkControls editor={editor} />
                <ImageControl editor={editor} />

                <ToolbarSeparator />
                <ToolbarButton title="Regla horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <Minus className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton title="Salto de línea" onClick={() => editor.chain().focus().setHardBreak().run()}>
                    ↵
                </ToolbarButton>

                <div className="ml-auto flex gap-2">
                    <ToolbarButton title="Deshacer (Ctrl+Z)" disabled={!st.canUndo} onClick={() => editor.chain().focus().undo().run()}>
                        <RotateCcw className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Rehacer (Ctrl+Shift+Z)" disabled={!st.canRedo} onClick={() => editor.chain().focus().redo().run()}>
                        <RotateCw className="w-4 h-4" />
                    </ToolbarButton>
                </div>
            </div>
        </div>
    )
}

/**
 * Props:
 * - sidebarExpanded, sidebarWidthExpanded, sidebarWidthCollapsed: para adaptar al layout con sidebar
 * - initialContent: HTML inicial
 */
export default function RichTextEditor({
    initialContent = `
    <h2>Hola 👋</h2>
    <p>Este editor replica funciones clave tipo Word: estilos, listas, alineación, color, enlaces e imágenes.</p>
    <ul><li>Viñetas</li><li>Listas ordenadas</li></ul>
    <blockquote>“La simplicidad es la máxima sofisticación.”</blockquote>
  `,
}) {
    // Alineado con tu sidebar (w-64 / w-16)
    const SIDEBAR_EXPANDED = 256
    const SIDEBAR_COLLAPSED = 64

    // Detecta estado del sidebar
    const [sidebarOpen, setSidebarOpen] = useState(
        () => !document.documentElement.classList.contains('sidebar-collapsed')
    )
    useEffect(() => {
        const handler = (e) => setSidebarOpen(!!e.detail?.open)
        window.addEventListener('sidebar:toggle', handler)
        return () => window.removeEventListener('sidebar:toggle', handler)
    }, [])

    const editor = useEditor({
        extensions,
        content: initialContent,
        editorProps: { attributes: { class: 'tiptap min-h-[360px] outline-none' } },
    })

    const availableWidth = `min(1200px, calc(100vw - ${(sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED)}px))`

    return (
        <div className="transition-[max-width] duration-300 ease-out" style={{ maxWidth: availableWidth, margin: '0 auto' }}>
            {/* MenuBar idéntico al original */}
            {MenuBar({ editor })}
            <div className="mx-auto max-w-[min(1200px,100%)] px-3 pb-8">
                <div className="rounded-2xl border shadow-sm bg-white text-neutral-900 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-800">
                    <EditorContent editor={editor} className="prose prose-neutral max-w-none p-5 sm:p-8 dark:prose-invert" />
                </div>
            </div>
        </div>
    )
}