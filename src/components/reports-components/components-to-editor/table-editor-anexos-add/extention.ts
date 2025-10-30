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


    renderHTML({ node }) {
        return [
            "div",
            {
                "data-raw-html": encodeURIComponent(node.attrs.html), // 🔒 Guarda el HTML limpio pero escapado
                class: "raw-html-block",
            },
        ]
    },
    parseHTML() {
        return [
            {
                tag: "div[data-raw-html]",
                getAttrs: (el) => {
                    const raw = (el as HTMLElement).getAttribute("data-raw-html")
                    return { html: decodeURIComponent(raw || "") }
                },
            },
        ]
    },

    addNodeView() {
        return ({ node }) => {
            const container = document.createElement("div");
            container.classList.add("raw-html-block");
            container.innerHTML = node.attrs.html;
            return { dom: container };
        };
    },
})
