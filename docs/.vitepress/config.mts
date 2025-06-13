import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Awesome Project",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "HTML",
        link: "/html",
        items: [{ text: "defer、async", link: "/html/defer-async" }],
      },
      {
        text: "CSS",
        items: [
          { text: "box-sizing", link: "/css/box-sizing" },
          { text: "css selector", link: "/css/selector" },
          { text: "css specificity", link: "/css/specificity" },
          { text: "responsive layout", link: "/css/responsive-layout" },
        ],
      },
      {
        text: "JS",
        items: [
          { text: "date-type", link: "/js/data-type" },
          { text: "object、map", link: "/js/object、map" },
          { text: "for..in、for..of", link: "/js/for-in&of" },
          { text: "var、let、const", link: "/js/var-let-const" },
          { text: "scope", link: "/js/scope" },
          { text: "shallow&deep-copy", link: "/js/shallow&deep-copy" },
          { text: "prototype", link: "/js/prototype" },
          { text: "new", link: "/js/new" },
          { text: "closure", link: "/js/closure" },
          {
            text: "functional-programming",
            link: "/js/functional-programming",
          },
          { text: "debounce、throttle", link: "/js/debounce-throttle" },
          { text: "promise", link: "/js/promise" },
          { text: "chained-promises", link: "/js/chained-promises" },
        ],
      },
      {
        text: "Browser",
        items: [
          { text: "eventloop", link: "/browser/eventloop" },
          {
            text: "process-thread",
            link: "/browser/process-thread",
          },
          { text: "render", link: "/browser/render" },
          {
            text: "input url loading process",
            link: "/browser/input-url-loading-process",
          },
          {
            text: "cookie、storage、indexDB",
            link: "/browser/cookie、storage、indexDB",
          },
          { text: "seo", link: "/browser/seo" },
        ],
      },
      {
        text: "React",
        items: [
          { text: "JSX", link: "/react/jsx" },
          { text: "strict-mode", link: "/react/strict-mode" },
          {
            text: "hooks",
            link: "/react/hooks",
            items: [
              { text: "useState", link: "/react/useState" },
              { text: "useReducer", link: "/react/useReducer" },
              { text: "useContext", link: "/react/useContext" },
              { text: "useRef", link: "/react/useRef" },
              { text: "useEffect", link: "/react/useEffect" },
              { text: "useLayoutEffect", link: "/react/useLayoutEffect" },
            ],
          },
          { text: "fiber", link: "/react/fiber" },
        ],
      },
      {
        text: "Vue",
        items: [
          { text: "vue2.x-notes", link: "/vue/vue2.x-notes" },
          { text: "reactivity", link: "/vue/reactivity" },
          { text: "render pipeline", link: "/vue/render-pipeline" },
        ],
      },
      {
        text: "Frontend Engineer",
        items: [
          { text: "git", link: "/enginner/git" },
          { text: "module", link: "/enginner/module" },
          {
            text: "webpack",
            link: "/enginner/webpack",
            items: [
              { text: "config", link: "/enginner/webpack-config" },
              { text: "loader", link: "/enginner/webpack-loader" },
              {
                text: "loader develop",
                link: "/enginner/webpack-loader-develop",
              },
              {
                text: "splitChunks",
                link: "/enginner/webpack-splitChunks",
              },
              { text: "terser", link: "/enginner/webpack-terser" },
              { text: "hmr", link: "/enginner/webpack-HMR" },
            ],
          },
          {
            text: "performance optimization",
            link: "/enginner/performance-optimization",
            items: [
              { text: "Performance Index", link: "/enginner/performance-index" },
              { text: "Performance API", link: "/enginner/performance-api" },
              { text: "Dom Fragment", link: "/enginner/dom-fragment" },
            ],
          },
        ],
      },
      {
        text: "Next.js",
        items: [
          { text: "next", link: "/next/index.md" },
          { text: "csr、ssr", link: "/next/csr、ssr" },
          { text: "server & client components", link: "/next/server&client-components" },
          // { text: "layout-pages", link: "/next/layout-pages" },
          // { text: "image", link: "/next/image" },
        ],
      },
      {
        text: "Network",
        items: [
          { text: "CORS", link: "/network/cors" },
          {
            text: "cross origin request",
            link: "/network/cross-origin-requests",
          },
          { text: "cache-straregy", link: "/network/cache-straregy" },
        ],
      },
      {
        text: "Project",
        items: [
          {
            text: "backend-authentication",
            link: "/project/backend-authentication",
          },
          {
            text: "internationalization",
            link: "/project/internationalization",
          },
          { text: "micro frontEnd", link: "/project/micro-frontend" },
          { text: "Qiankun", link: "/project/qiankun" },
        ],
      },
      {
        text: "Bugs",
        items: [{ text: "setTimeout-error", link: "/bugs/setTimeout-error" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
  srcDir: "src",
})
