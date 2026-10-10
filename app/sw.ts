import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from "serwist";
import { Serwist, NetworkOnly } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: any;

// Nunca cachear rutas de API (como NextAuth) para evitar el error de JSON.parse
const noApiCache: RuntimeCaching = {
  matcher: ({ url }) => url.pathname.startsWith('/api/'),
  handler: new NetworkOnly(),
};

// Evitar cachear peticiones POST (Server Actions)
const noPostCache: RuntimeCaching = {
  matcher: ({ request }) => request.method === 'POST',
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [noPostCache, noApiCache, ...defaultCache],
});

serwist.addEventListeners();
