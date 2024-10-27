declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PWD: string;
      WS_PORT: string;
      HTTP_PORT: string;
    }
  }
}

export {};
