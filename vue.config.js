module.exports = {
  devServer: {
    proxy: {
      // 把对/boss的请求转发到target
      '/api/boss': {
        target: 'http://eduboss.lagou.com',
        changeOrigin: true,   //  把请求头中的host配置为target
        pathRewrite: {
          '^/api': '/',
        },
      },
      '/api/front': {
        target: 'http://edufront.lagou.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/',
        },
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
