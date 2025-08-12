import type { ProjectData } from "@/types/sidebar"

export const SIDEBAR_BY_TENANT: Record<string, ProjectData> = {
  copower: {
    admin: [
      {
        file: "User management",
        state: "OK",
        url: "/dashboard/users",
      },
      // {
      //   file: "api/hello/route.ts",
      //   state: "U",
      // },
      // {
      //   file: "app/layout.tsx",
      //   state: "M",
      // },
    ],
    tree: [
      // [
      //   "app",
      //   [
      //     "api",
      //     ["hello", ["route.ts"]],
      //     "page.tsx",
      //     "layout.tsx",
      //     ["blog", ["page.tsx"]],
      //   ],
      // ],
      [
        { "title": "Reports", "url": "#" },
        { "title": "Create", "url": "/dashboard/reports" },
        { "title": "List", "url": "/dashboard/listreports" },
        { "title": "Config", "url": "#" },
      ],
      [{ "title": "Analysis", "url": "#" },
      // ["Site CTY", "Alerts", "Analytics", "Administration"],
      [{ "title": "Site CTY", "url": "#" },
      { "title": "Electric", "url": "/dashboard/generator" },
      { "title": "Mechanic", "url": "/dashboard/motor" },
      { "title": "Termodicamic", "url": "/dashboard/termodinamic" },
      { "title": "Analytics", "url": "/dashboard/analisis" },
      { "title": "Administration", "url": "/dashboard/admin" },
      // { "title": "Test", "url": "/dashboard/test" },
      { "title": "Activos", "url": "/dashboard/activo" },
      ],

        // { "title": "Reports", "url": "/dashboard/reports" },
      ],
      // "util.ts",
      // "data.ts",
      // "visualization.tsx",
    ],
    // ["public", "favicon.ico", "vercel.svg"],
    // ".eslintrc.json",
    // ".gitignore",
    // "next.config.js",
    // "tailwind.config.js",
    // "package.json",
    // "README.md",
  },
  dautom: {
    admin: [
      {
        file: "User management",
        state: "OK",
        url: "/dashboard/users",
      },
    ],
    tree: [
      [
        { "title": "Reports", "url": "#" },
        { "title": "Create", "url": "/dashboard/reports" },
        { "title": "List", "url": "/dashboard/listreports" },
        { "title": "Config", "url": "#" },

      ],
      // ["Analysis",
      //   ["Site CTY", "Alerts", "Analytics", "Administration"],
      // ],
    ],
  },
}