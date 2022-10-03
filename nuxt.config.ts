import { defineNuxtConfig } from "nuxt3/config";
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  serverMiddleware: [
    // Will register file from project server-middleware directory to handle /server-api/* requests
    { path: "/server-api", handler: "~/server-middleware/index.ts" },
  ],
  vite: {
    plugins: [
      Components({
        // add option {resolveIcons: true} as parameter for resolving problem with icons
        resolvers: [AntDesignVueResolver({resolveIcons: true})],
      }),
    ],
    // @ts-expect-error: Missing ssr key
    ssr: {
      noExternal: ['moment', 'compute-scroll-into-view', 'ant-design-vue','@ant-design/icons-vue'],
    },  
  },
});
