import { Node, mergeAttributes } from '@tiptap/core';

export interface TwitterOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        twitter: {
            setTwitter: (options: { url: string }) => ReturnType;
        };
    }
}

export const Twitter = Node.create<TwitterOptions>({
    name: 'twitter',

    addOptions() {
        return {
            HTMLAttributes: {
                class: 'twitter-embed',
            },
        };
    },

    group: 'block',

    draggable: true,

    addAttributes() {
        return {
            url: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-twitter-url]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const url = HTMLAttributes.url;
        const tweetId = url?.split('/status/')?.[1]?.split('?')?.[0]?.split('/')?.[0];

        if (!tweetId) {
            return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 'Invalid Twitter URL'];
        }

        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-twitter-url': url }),
            [
                'iframe',
                {
                    src: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
                    width: '100%',
                    height: 'auto',
                    frameborder: '0',
                    scrolling: 'no',
                    style: 'min-height: 500px; border: none; overflow: hidden; max-width: 550px; margin: 0 auto; display: block;',
                },
            ],
        ];
    },

    addCommands() {
        return {
            setTwitter:
                ({ url }) =>
                    ({ chain }) => {
                        return chain()
                            .insertContent({
                                type: this.name,
                                attrs: { url },
                            })
                            .run();
                    },
        };
    },
});
