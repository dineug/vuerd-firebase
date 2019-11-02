module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/scss/color.scss";
        `
      }
    }
  }
};
