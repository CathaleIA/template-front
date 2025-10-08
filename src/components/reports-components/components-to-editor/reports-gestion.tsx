import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MenuBar from './menu-basr';
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import AnexosToAddEditor from './table-editor-anexos-add/anexos-to-add-editor';
import {RawHTMLBlock} from '@/components/reports-components/components-to-editor/table-editor-anexos-add/extention';


interface TableGestionAnexoToRichText {
    // parametros para cargar los anexos
    tenant_name: string;
    job_id: string;
    estado: string;
    type: string;
}
export default function ReportsGestion({ tenant_name, job_id, estado, type }: TableGestionAnexoToRichText) {
    
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
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-black pl-4 my-6 italic text-gray-600',
                    },
                },
                horizontalRule: {
                    HTMLAttributes : {
                        class: 'my-8 border-t border-gray-200'
                    },
                }

            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({
                HTMLAttributes: {
                    class: 'my-custom-class',
                },
            }),

            RawHTMLBlock



        ],
        content: 'Crea ahora el reporte y adjunta los archivos necesarios.',
        // Don't render immediately on the server to avoid SSR issues
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "tiptap min-h-[200px] border rounded-md bg-slate-50 py-2 px-3"
            }
        }
    })

   

    // Esta comentado el componente para efectos precticos

    return (
        <div className='flex'>
            <div className='w-6/5 p-2'>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} id='Report_PDF_Component' className="tiptap"/>
            </div>
            <div className='w-2/5 p-4'>
                <AnexosToAddEditor tenant_name={tenant_name} job_id={job_id} estado={estado} type={type} editor={editor} />
            </div>
        </div>
    )
}
