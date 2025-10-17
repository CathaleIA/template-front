import { Node } from "@tiptap/core"

export const RawHTMLBlock = Node.create({
    name: "rawHTMLBlock",
    group: "block",
    atom: true, // se trata como una sola unidad
    selectable: true,

    addAttributes() {
        return {
            html: {
                default: "",
            },
        }
    },

    parseHTML() {
        return [{ tag: "div[data-raw-html]" }]
    },

    renderHTML({ node }) {
        return [
            "div",
            { "data-raw-html": "", class: "raw-html-block" },
              node.attrs.html || "",
        ]
    },

    addNodeView() {
        return ({ node }) => {
            const container = document.createElement("div")
            container.classList.add("raw-html-block");

            setTimeout(() => {
                container.innerHTML = node.attrs.html;
            }, 3000); //asegura que el render del editor se complete

            return {
                dom: container,
            }
        }
    },
})
