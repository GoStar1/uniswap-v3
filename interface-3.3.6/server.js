const express = require('express');
const path = require('path');
const app = express();

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'build')));

// 对于所有请求，返回index.html以支持React路由
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 设置监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Uniswap Interface running on port ${PORT}`);
});