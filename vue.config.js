module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/scss/color.scss";
          @import "@/scss/size.scss";
        `
      }
    }
  },
  chainWebpack(config) {
    config.plugins.delete("prefetch");
  }
};
