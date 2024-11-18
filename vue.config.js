const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    loaderOptions: {
      scss: {
        // Automatically include global.scss in every SCSS file
        additionalData: `@import "@/styles/global.scss";`,
      },
    },
  },
  publicPath: process.env.NODE_ENV === "production" ? "/lico-badge/" : "/",
});
