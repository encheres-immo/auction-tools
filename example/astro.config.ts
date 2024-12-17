import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
    // Define environment variables here. These will be available in your components and pages.
    API_KEY: envField.string({ context: "client", access: "public", optional: false }),
    API_ENV: envField.string({ context: "client", access: "public", optional: false }),
    PROPERTY_ID: envField.string({ context: "client", access: "public", optional: false }),
    ALLOW_USER_REGISTRATION: envField.boolean({ context: "client", access: "public", default: true }),
    TOS_URL: envField.string({ context: "client", access: "public", default: "" }),
    },
  },
});
