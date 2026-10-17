/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GoatCounter の送り先。ないときはアクセス解析を動かさない */
  readonly VITE_GOATCOUNTER_URL?: string
}
