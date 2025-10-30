import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MenuBar from './menu-basr';
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import AnexosToAddEditor from './table-editor-anexos-add/anexos-to-add-editor';
import { RawHTMLBlock } from '@/components/reports-components/components-to-editor/table-editor-anexos-add/extention';
import { TableKit } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import FileHandler from '@tiptap/extension-file-handler'
import { v4 as uuidv4 } from 'uuid';

interface TableGestionAnexoToRichText {
    // parametros para cargar los anexos
    tenant_name: string;
    job_id: string;
    userPoolId: string;
    estado: string;
    type: string;
    activo?: string;
    templateForm?: string;
}
export default function ReportsGestion({ tenant_name, userPoolId, job_id, estado, type, activo, templateForm }: TableGestionAnexoToRichText) {

    const editor = useEditor({

        extensions: [
            TableKit.configure({
                table: { resizable: true }


            }),

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
                    HTMLAttributes: {
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
            Image,
            FileHandler.configure({
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/jpg'],
                onDrop: (currentEditor, files, pos) => {
                    files.forEach(file => {
                        const reader = new FileReader()
                        reader.onload = () => {
                            currentEditor
                                .chain()
                                .insertContentAt(pos, {
                                    type: 'image',
                                    attrs: { src: reader.result },
                                })
                                .focus()
                                .run()
                        }
                        reader.readAsDataURL(file)
                    })
                }
            }),
            RawHTMLBlock



        ],
         content: templateForm ? templateForm : "Crea ahora el reporte y adjunta los archivos necesarios.",
        // Don't render immediately on the server to avoid SSR issues
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "tiptap min-h-[200px] border rounded-md bg-slate-50 py-2 px-3"
            }
        }
    })



    // Esta comentado el componente para efectos precticos
    const FileName = `reporte-final-${job_id}`;
    return (
     <div className="flex h-[600px] gap-4"> 
    {/* Panel del editor */}
    <div className="flex-1 flex flex-col border rounded-md bg-white p-2 overflow-hidden">
      <MenuBar editor={editor} tenant_name={tenant_name} userPoolId={userPoolId} fileName={FileName} job_id={job_id} activo={activo}/>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-md">
        <EditorContent
          editor={editor}
          onDrop={(e) => e.preventDefault()}
          id="Report_PDF_Component"
          className="tiptap prose prose-sm max-w-none"
        />
      </div>
    </div>

    {/* Panel lateral (Anexos) */}
    <div className="w-2/5 border rounded-md bg-white p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <AnexosToAddEditor
        tenant_name={tenant_name}
        job_id={job_id}
        estado={estado}
        type={type}
        editor={editor}
      />
    </div>
  </div>
    )
}
