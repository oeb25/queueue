interface ImportMetaEnv {
  VITE_API_URL: string;
}

declare type Opaque<Type, Token = unknown> = Type & {
  readonly __opaque__: Token;
};
