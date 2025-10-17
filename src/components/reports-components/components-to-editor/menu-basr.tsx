import { Toggle } from "@/components/ui/toggle"
import {
    AlignCenter, AlignLeft, Download, AlignRight,
    TextQuote, BetweenHorizontalStart,BetweenVerticalEnd ,Tablets, 
    Columns3Cog,Grid2x2X, BetweenHorizontalEnd ,Table, BetweenVerticalStart 
    , Bold, 
    FlipHorizontal, Heading1, Heading2, Heading3, Highlighter, Italic, List, ListOrdered, Strikethrough
} from 'lucide-react'
import React from 'react'
import { Editor } from '@tiptap/react'
interface MenuBarProps {
    editor: Editor | null
    tenant_name?: string;
    userPoolId?: string;
    job_id?: string;
    activo?: string;
    fileName: string
}


export default function MenuBar({ editor, tenant_name, userPoolId, job_id, activo, fileName}: MenuBarProps) {
    if (!editor) {
        return null
    }

    const Options = [
        {
            icon: <Heading1 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            pressed: () => editor.isActive('heading', { level: 1 })
        },
        {
            icon: <Heading2 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            pressed: () => editor.isActive('heading', { level: 2 })
        },
        {
            icon: <Heading3 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            pressed: () => editor.isActive('heading', { level: 3 })
        },
        {
            icon: <Bold className="size-4" />,
            onClick: () => editor.chain().focus().toggleBold().run(),
            pressed: () => editor.isActive('bold')
        },
        {
            icon: <Italic className="size-4" />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            pressed: () => editor.isActive('italic')
        },
        {
            icon: <Strikethrough className="size-4" />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            pressed: () => editor.isActive('strike')
        },
        {
            icon: <AlignLeft className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign('left').run(),
            pressed: () => editor.isActive({ textAlign: 'left' })
        },
        {
            icon: <AlignCenter className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign('center').run(),
            pressed: () => editor.isActive({ textAlign: 'center' })
        },
        {
            icon: <AlignRight className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign('right').run(),
            pressed: () => editor.isActive({ textAlign: 'right' })
        },
        {
            icon: <List className="size-4" />,
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            pressed: () => editor.isActive('bulletList')
        },
        {
            icon: <ListOrdered className="size-4" />,
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            pressed: () => editor.isActive('orderedList')
        },
        {
            icon: <Highlighter className="size-4" />,
            onClick: () => editor.chain().focus().toggleHighlight().run(),
            pressed: () => editor.isActive('highlight')
        },
        {
            icon: <FlipHorizontal className="size-4" />,
            onClick: () => editor.chain().focus().setHorizontalRule().run(),
            pressed: () => false
        },
        {
            icon: <TextQuote className="size-4" />,
            onClick: () => editor.chain().focus().toggleBlockquote().run(),
            pressed: () => editor.isActive('blockquote')
        },
        {
            icon: <Download className="size-4" />,
            onClick: async () => {
                try {

                    const html = editor.getHTML();
                    const s3KeyFolder = `FINALREPORTS/${tenant_name}/${userPoolId}/${job_id}/${activo}/${fileName}.html`;
              
                    const base64Html = btoa(unescape(encodeURIComponent(html)));

                    const res = await fetch("/api/upload-final-report", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            s3key: s3KeyFolder,
                            archivoHtml: base64Html,
                        }),
                    });

                    if (!res.ok) throw new Error("Error al subir el archivo");

                    const data = await res.json();
                    console.log("✅ Archivo subido con éxito:", data);
                } catch (error) {
                    console.error("❌ Error en la subida:", error);
                }
            },
            pressed: () => false
        },{
            icon: <Table className="size-4" />,
            onClick: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
            pressed: () => false
        },{
            icon: <BetweenVerticalStart className="size-4" />,
            onClick: () => editor.chain().focus().addColumnBefore().run(),
            pressed: () => false
        },
        {
            icon: <BetweenVerticalEnd  className="size-4" />,
            onClick: () => editor.chain().focus().addColumnAfter().run(),
            pressed: () => false
        },{
            icon: <Columns3Cog className="size-4" />,
            onClick: () => editor.chain().focus().deleteColumn().run(),
            pressed: () => false
        },{
            icon: <BetweenHorizontalEnd className="size-4" />,
            onClick: () => editor.chain().focus().addRowBefore().run(),
            pressed: () => false
        },{
            icon: <BetweenHorizontalStart className="size-4" />,
            onClick: () => editor.chain().focus().addRowAfter().run(),
            pressed: () => false
        },{
            icon: <Grid2x2X className="size-4" />,
            onClick: () => editor.chain().focus().deleteRow().run(),
            pressed: () => false   
        },{
            icon: <Tablets className="size-4" />,
            onClick: () => editor.chain().focus().deleteTable().run(),
            pressed: () => false
        }


    ]
    return (

        <div className="border rounded-md p-1 mb-1 bg-blue-50 space-x-2 z-50" >
            {Options.map((option, index) => (
                <Toggle
                    key={index}
                    pressed={option.pressed()}
                    onPressedChange={option.onClick}

                >
                    {option.icon}
                </Toggle>
            ))}


        </div>
    )
}
