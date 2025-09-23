/// <reference types="vite/client" />

declare module '*.svg' {
    const src: string;
    export default src;
}

declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}

declare module '*.jpeg' {
    const src: string;
    export default src;
}

declare module '*.gif' {
    const src: string;
    export default src;
}

declare module '*.webp' {
    const src: string;
    export default src;
}

// --- ImportMetaEnv config ---
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  // aquí puedes añadir más variables
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
