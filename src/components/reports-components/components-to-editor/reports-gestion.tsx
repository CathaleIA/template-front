import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MenuBar from './menu-basr';
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'

export default function ReportsGestion() {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: {
                        class: "list-disc ml-3"
                    }
                },
                orderedList: {
                    HTMLAttributes: {
                        class: "list-decimal ml-3"
                    }
                }

            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({
                HTMLAttributes: {
                    class: 'my-custom-class',
                },
            })


        ],
        content: 'Crea ahora el reporte y adjunta los archivos necesarios.',
        // Don't render immediately on the server to avoid SSR issues
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "min-h-[200px] border rounded-md bg-slate-50 py-2 px-3"
            }
        }
    })

    return (
        <div className='max-w-5xl mx-auto py-8'>
            <MenuBar editor={editor}  />
  
            <EditorContent editor={editor} id='Report_PDF_Component'/>
        </div>
    )
}
