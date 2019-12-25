module.exports = {
  productionSourceMap: false,
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/scss/color.scss";
          @import "@/scss/size.scss";
        `
      }
    },
    extract: {
      filename: "css/[name].css?hash=[chunkhash:8]",
      chunkFilename: "css/[name].css?hash=[chunkhash:8]"
    }
  },
  chainWebpack(config) {
    config.output.filename("js/[name].js?hash=[hash:8]");
    config.output.chunkFilename("js/[name].js?hash=[chunkhash:8]");
    config.plugins.delete("prefetch");
  }
};
