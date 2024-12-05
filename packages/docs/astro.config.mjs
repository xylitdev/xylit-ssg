import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://xylit.dev",
  integrations: [
    starlight({
      favicon: "/logo.svg",
      title: "Xylit",
      editLink: {
        baseUrl: "https://github.com/xylitdev/xylitdev.github.io/edit/main/",
      },
      logo: {
        src: "./public/logo.svg",
      },
      social: {
        github: "https://github.com/xylitdev",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: "Installation And Setup",
              link: "/getting-started/installation-and-setup",
            },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
