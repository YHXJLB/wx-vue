# wx-vue

Vue 3重构的微信小程序项目，适配HBuilder构建。

此项目基于原微信小程序项目 YHXJLB/wx 进行重构，采用 Vue 3 Composition API 和相关生态技术栈，旨在提供更好的开发体验和性能，并适配 HBuilder 构建环境。

## 技术栈

*   Vue 3
*   Vue Router
*   Pinia
*   Vite
*   uni-app (用于API兼容层，可选)

## 项目结构

*   `src/`: 源代码目录
    *   `assets/`: 静态资源
    *   `components/`: Vue组件
    *   `composables/`: Vue 3 Composables
    *   `pages/`: 页面组件
    *   `router/`: 路由配置
    *   `stores/`: Pinia Store
    *   `utils/`: 工具函数
    *   `api/`: API接口封装
    *   `App.vue`: 根组件
    *   `main.js`: 入口文件
*   `public/`: 公共静态资源
*   `index.html`: HTML模板
*   `vite.config.js`: Vite配置文件
*   `manifest.json`: HBuilder项目配置文件
*   `pages.json`: uni-app页面配置文件 (如果使用)

## 安装依赖

```bash
npm install
```

## 开发模式

```bash
npm run dev
```

## 构建

```bash
npm run build:h5 # 构建H5版本
```

## HBuilder 构建

1.  使用 HBuilderX 打开此项目。
2.  配置 `manifest.json` 以满足您的需求。
3.  运行或发行项目。
