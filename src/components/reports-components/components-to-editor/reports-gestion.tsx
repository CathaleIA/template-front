// components/reports-components/components-to-editor/ReportsGestion.tsx

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
import '@/components/reports-components/formulario-cap-datos-report-final/CreateFinalReportFile.module.css'; // 🔥 Importar los estilos
import { useEffect } from 'react';


interface TableGestionAnexoToRichText {
    tenant_name: string;
    job_id: string;
    userPoolId: string;
    estado: string;
    type: string;
    activo?: string;
    templateForm?: string;
}

export default function ReportsGestion({ 
    tenant_name, 
    userPoolId, 
    job_id, 
    estado, 
    type, 
    activo, 
    templateForm 
}: TableGestionAnexoToRichText) {

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
        content: templateForm || "Crea ahora el reporte y adjunta los archivos necesarios.",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "report-editor-content min-h-[200px] border rounded-md bg-slate-50 py-2 px-3"
            }
        }
    })


    // 🔥 Inyectar estilos dinámicamente
    useEffect(() => {
        const styleId = 'report-editor-styles';
        
        // Verificar si ya existe
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #Report_Editor_Container {
                padding: 20px;
                background: white;
            }

            #Report_Editor_Container .ProseMirror {
                padding: 40px 60px !important;
                background: white !important;
                min-height: 800px;
            }

            #Report_Editor_Container h1 {
                text-align: center !important;
                font-size: 16pt !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
                margin-bottom: 30px !important;
                margin-top: 40px !important;
                color: #000 !important;
                letter-spacing: 0.5px !important;
            }

            #Report_Editor_Container h2 {
                font-size: 12pt !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
                margin-top: 40px !important;
                margin-bottom: 16px !important;
                color: #000 !important;
                border-bottom: 2px solid #333 !important;
                padding-bottom: 6px !important;
            }

            #Report_Editor_Container p {
                text-align: justify !important;
                margin-bottom: 12px !important;
                line-height: 1.6 !important;
                font-size: 10pt !important;
            }

            #Report_Editor_Container .ProseMirror > h1 + p,
            #Report_Editor_Container .ProseMirror > h1 + p + p,
            #Report_Editor_Container .ProseMirror > h1 + p + p + p {
                text-align: center !important;
                text-transform: uppercase !important;
                margin-top: 20px !important;
                margin-bottom: 20px !important;
            }

            #Report_Editor_Container .tableWrapper {
                margin: 30px 0 !important;
            }

            #Report_Editor_Container table {
                width: 100% !important;
                border-collapse: collapse !important;
                margin-bottom: 20px !important;
                font-size: 9pt !important;
            }

            #Report_Editor_Container table td,
            #Report_Editor_Container table th {
                border: 1px solid #333 !important;
                padding: 8px 12px !important;
                vertical-align: top !important;
            }

            #Report_Editor_Container table th {
                background-color: #f3f4f6 !important;
                font-weight: bold !important;
                text-align: center !important;
                color: #000 !important;
            }

            #Report_Editor_Container ul.list-disc {
                margin-left: 30px !important;
                margin-bottom: 16px !important;
                padding-left: 10px !important;
            }

            #Report_Editor_Container ul.list-disc li {
                margin-bottom: 8px !important;
                line-height: 1.5 !important;
            }

            #Report_Editor_Container h2 + p {
                margin-top: 12px !important;
            }

            #Report_Editor_Container h2:not(:first-of-type) {
                margin-top: 60px !important;
            }
        `;

        document.head.appendChild(style);

        // Cleanup
        return () => {
            const existingStyle = document.getElementById(styleId);
            if (existingStyle) {
                existingStyle.remove();
            }
        };
    }, []);

    const FileName = `reporte-final-${job_id}`;

    return (
        <div className="flex h-[600px] gap-4"> 
            {/* Panel del editor */}
            <div className="flex-1 flex flex-col border rounded-md bg-white p-2 overflow-hidden">
                <MenuBar 
                    editor={editor} 
                    tenant_name={tenant_name} 
                    userPoolId={userPoolId} 
                    fileName={FileName} 
                    job_id={job_id} 
                    activo={activo}
                />
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-md">
                    <EditorContent
                        editor={editor}
                        onDrop={(e) => e.preventDefault()}
                        id="Report_Editor_Container"
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