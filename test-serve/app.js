const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 托管了 dist 目录，当访问 / 的时候，默认会返回托管目录中的 index.html 文件
app.use(express.static(path.join(__dirname, '../dist')));

app.use('/api/boss', createProxyMiddleware({
  target: 'http://eduboss.lagou.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

app.use('/api/front', createProxyMiddleware({
  target: 'http://edufront.lagou.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

app.listen(3030, () => {
  console.log('running...');
});
