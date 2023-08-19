// FootnoteRef.js
import { Node } from '@tiptap/core';
import markdownitFootnotes from 'markdown-it-footnote';

export default Node.create({
    name: 'footnoteRef',

    group: 'inline',

    inline: true,

    addCommands() {
        return {
            addFootnote: () => ({ commands }) => {
                let rootNode = this.editor.state.doc;
                let footnoteRefCount = 0;
                rootNode.descendants((node) => {
                    if (node.type.name === 'footnote') {
                        footnoteRefCount++;
                    }
                });
                let newCount = footnoteRefCount += 1;
                commands.insertContent({
                    type: 'footnoteRef',
                    attrs: {
                        id: newCount,
                        href: "#ref" + newCount,
                        content: "[" + newCount + "]"
                    },
                });

                // Get the end position of the document
                let endPos = this.editor.state.doc.content.size + 1;

                // Insert footnote at the end of the document
                commands.insertContentAt(endPos, {
                    type: 'footnote',
                    attrs: {
                        id: "fn" + newCount,
                        href: "#ref" + newCount,
                        content: "hello"
                    },
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: '–',
                                },
                            ],
                        },
                    ],
                });
            },
        };
    },

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

    parseHTML() {
        return [
            {
                tag: 'sup.footnote-ref a',
                getAttrs: (node) => ({
                    id: node.getAttribute('id'),
                    href: node.getAttribute('href'),
                    content: node.textContent,
                }),
                priority: 201
            },
        ];
    },

    //this is how it will be rendered in the editor
    renderHTML({ node }) {
        return [
            'sup',
            { class: 'footnote-ref' },
            ['a', { href: node.attrs.href, id: node.attrs.id }, node.attrs.content]
        ];
    },

    addStorage() {
        return {
            markdown: {
                serialize(state, node) {
                    state.write("[^" + (node.attrs.content.replace(/\[|\]/g, '')) + "]");
                    // state.flushClose(1);
                    // state.closeBlock(node);
                },
                parse: {
                    setup(markdownit) {
                        var md = markdownit.use(markdownitFootnotes, 'footnoteRef');
                        // change parsing for easier use with tiptap
                        md.renderer.rules.footnote_block_open = () => (
                            '<div class="footnotes">\n' +
                            ''
                        );
                        md.renderer.rules.footnote_block_close = () => (
                            '</div>\n'
                        );
                        // shift the link before the reference text
                        md.renderer.rules.footnote_open = (tokens, idx, options, env, slf) => {
                            var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
                            if (tokens[idx].meta.subId > 0) {
                                id += ':' + tokens[idx].meta.subId;
                            }
                            return '<li id="fn' + id + '" class="footnote-item"><a href="#fnref' + id + '" class="footnote-backref">'+id+'</a>'
                        };
                        md.renderer.rules.footnote_anchor = () => (
                            ''
                        );


                    },
                }
            }
        }
    },
});