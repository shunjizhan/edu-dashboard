module.exports = {
  devServer: {
    proxy: {
      // 把对/boss的请求转发到target
      '/boss': {
        target: 'http://eduboss.lagou.com',
        changeOrigin: true,   //  把请求头中的host配置为target
      },
      '/front': {
        target: 'http://edufront.lagou.com',
        changeOrigin: true,
      },
    },
  },
  css: {
    loaderOptions: {
      scss: {
        prependData: '@import "~@/styles/variables.scss";',
      },
    },
  },
};
