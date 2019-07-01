# proxy README

以 webpack devServer 方式开启本地服务并启动域名代理

## Features

兼容 `webpack devServer` 配置

## Requirements

需要在项目根目录增加 `.proxyrc.js` 配置文件，写入需要的配置信息。

例如：

```javascript
module.exports = {
  hot: true,
  host: '0.0.0.0',
  port: 8080,
  https: false,
  hotOnly: false,
  disableHostCheck: true,
  proxy: {
    '/search/': {
      target: 'http://www.xxx.cn',
      // pathRewrite: { '^/search/': '' },
      secure: false,
      changeOrigin: true,
      cookieDomainRewrite: {
        'xxx.net': ''
      },
      logLevel: 'debug'
    },
    '/get': {
      target: 'http://www.xxx.cn',
      secure: false,
      changeOrigin: true
    },
  }
};
```

## Extension Settings

## Known Issues

## Release Notes

## 0.1.0

增加代理与解析参考 vue-service https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/commands/serve.js#L97

## 0.0.4

移动生产环境依赖组件

## 0.0.3

调试处理发布后无法显示的问题

### 0.0.2

只是换了图标

### 0.0.1

发布初级版本
