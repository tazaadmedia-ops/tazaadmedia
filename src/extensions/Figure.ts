import { Node, mergeAttributes } from '@tiptap/core';

export interface FigureOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        figure: {
            setFigure: (options: { src: string; alt?: string; title?: string }) => ReturnType;
        };
    }
}

export const Figure = Node.create<FigureOptions>({
    name: 'figure',

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    group: 'block',

    content: 'inline*',

    draggable: true,

    isolating: true,

    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: (element) => element.querySelector('img')?.getAttribute('src'),
            },
            alt: {
                default: null,
                parseHTML: (element) => element.querySelector('img')?.getAttribute('alt'),
            },
            title: {
                default: null,
                parseHTML: (element) => element.querySelector('figcaption')?.innerText,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'figure',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'figure',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            ['img', { src: HTMLAttributes.src, alt: HTMLAttributes.alt }],
            ['figcaption', {}, 0],
        ];
    },

    addCommands() {
        return {
            setFigure:
                ({ src, alt, title }) =>
                    ({ chain }) => {
                        return chain()
                            .insertContent({
                                type: this.name,
                                attrs: { src, alt },
                                content: title ? [{ type: 'text', text: title }] : [],
                            })
                            .run();
                    },
        };
    },
});
