/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOGIN_USERNAME?: string;
  readonly VITE_LOGIN_PASSWORD?: string;
  readonly VITE_LOGIN_PHONE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

