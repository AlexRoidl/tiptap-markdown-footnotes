// Footnote.js
import { Node } from '@tiptap/core';
import markdownitFootnotes from 'markdown-it-footnote';
import { Schema, DOMParser } from 'prosemirror-model';



export default Node.create({
    name: 'footnote',

    group: 'block',

    content: 'block*',
    // defining: true,
    // selectable: true,
    // draggable: true,

    addAttributes() {
        return {
            id: {
                default: null,
            },
            href: {
                default: null,
            },
            content: {
                default: null,
            },
        };
    },

    addStorage() {
        return {
            markdown: {
                serialize(state, node) {
                    console.log(node.content);
                    state.write("[^" + (node.attrs.id.replace("fn", '')) + "]: ");
                    state.renderContent(node);
                    state.flushClose(1);
                    state.closeBlock(node);
                },
                parse: {
                    setup(markdownit) {
                        // console.log("parsed footnote");
                        // markdownit.use(markdownitFootnotes, 'footnote');
                    },
                }
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'li.footnote-item',
                getAttrs: (node) => ({
                    id: node.getAttribute('id'),
                    href: node.querySelector("a").getAttribute('href'),
                    content: Array.from(node.querySelector("p").childNodes)
                        .filter(child => child.nodeName.toLowerCase() !== 'a')
                        .map(child => child.textContent)
                        .join(''),
                }),
                getContent: (node) => {
                    console.log(node.childNodes[1])
                    return DOMParser.fromSchema(this.editor.schema).parseSlice(node.childNodes[1]).content;
                },
                priority: 200
            },
        ];
    },

    renderHTML({ node }) {
        return [
            'p',
            { class: 'footnote-item', id: node.attrs.id },
            [
                'a',
                { href: node.attrs.id.replace('fn', '#fnref'), class: 'footnote-backref' },
                node.attrs.id.replace('fn', '')+": "
            ],
            [
                'p',
                { class: 'footnote-text', style:"display:inline-block" },
                0
            ]
        ]
    }
});