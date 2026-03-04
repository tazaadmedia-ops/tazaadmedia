/**
 * Polyfills for common Node.js globals to ensure compatibility with 
 * legacy CommonJS packages in a Vite environment.
 */

if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
}

if (typeof (window as any).process === 'undefined') {
    (window as any).process = {
        env: {
            NODE_ENV: import.meta.env.MODE,
        }
    };
}

if (typeof (window as any).require === 'undefined') {
    (window as any).require = (name: string) => {
        console.warn(`Polyfilled require called for: ${name}. Returning empty object.`);
        return {};
    };
}

export { };
