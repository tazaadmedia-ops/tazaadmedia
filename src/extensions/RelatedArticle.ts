import { Node, mergeAttributes } from '@tiptap/core';


export interface RelatedArticleOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        relatedArticle: {
            setRelatedArticle: (options: { id: string; title: string; image?: string; url?: string }) => ReturnType;
        };
    }
}

export const RelatedArticle = Node.create<RelatedArticleOptions>({
    name: 'relatedArticle',

    group: 'block',

    atom: true,

    draggable: true,

    addAttributes() {
        return {
            id: {
                default: null,
            },
            title: {
                default: null,
            },
            image: {
                default: null,
            },
            url: {
                default: null,
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="related-article"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, { 'data-type': 'related-article', class: 'related-article-embed' }),
            ['div', { class: 'related-article-content' },
                ['span', { class: 'related-label' }, 'وڌيڪ پڙهو'], // "Read More" in Sindhi
                ['a', { href: `/article/${HTMLAttributes.id}`, target: '_blank', rel: 'noopener noreferrer' }, HTMLAttributes.title]
            ],
            HTMLAttributes.image ? ['img', { src: HTMLAttributes.image, class: 'related-article-image' }] : ''
        ];
    },

    addCommands() {
        return {
            setRelatedArticle:
                (options) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        });
                    },
        };
    },
});
