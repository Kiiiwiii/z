# 进阶：玉虚中期



## 1. 使用优化



#### 1.1 开发阶段的编译优化，某些 library 文件导致 bundle 过大

> 开发阶段的编译优化

bundle过大会导致，webpack的**编译速度变慢**。

* 优化1 - **externals**：这个时候我们可以将某些依赖通过 **手动** `<script>` 的方式引入 `index.html`, 然后让 webpack 忽略这个依赖，不将它打包入 `bundle`中

  * `webpack.config.json`

    ```js
    module.exports = {
      ...
      externals: {
        // 不想被放进 bundle的 依赖
        react: 'React'
      }
    };
    ```

  * `index.html`

    ```html
    <script
      defer
      src="cdn-url-of-react"
      crossorigin="anonymous">
    </script>
    ```

* 优化2 - **Resolve + alias**: 

  **指明路径**，提高 webpack 找到相关依赖的速度

  * `webpack.config.js`

    ```js
    module.exports = {
      //...
      resolve: {
        alias: {
          Utilities: path.resolve(__dirname, 'src/utilities/'),
          Templates: path.resolve(__dirname, 'src/templates/'),
          // 只能用作开发阶段，记得上线将 min 改回来
          react: path.join(nodeModulePath, '/react/dist/react.min')
        }
      }
    };
    ```

  * 直接在项目代码中使用

    ```js
    // main.js
    import {...} from 'react';
    import {...} from 'Utilities';
    ```

    * 不用自己写 path

    * 与 Angular 类似

      ```typescript
      import { HttpModule } from '@angular/common'
      ```

      > 也是一种 Alias 的方式

* 优化3： **module.noParse**

  针对于已知肯定，没有依赖其他模块的 文件





## 2. Code Splitting



#### 1. 手动更新 entry (not-recommended)

`webpack.config.json`

```js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
    another: './src/another-module.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```

手动成两个依赖 `index.bundle.js` 和 `another-module.bundle.js` 。维护起来不是很方便，也不能妥善处理 代码 duplication 的问题



####2. CommonChunks - SplitChunkPlugin - optimization 

> 参考第二章笔记

[Webpack-02-common-chunk-and-multiple-entry.md](Webpack-02-common-chunk-and-multiple-entry.md)





## 3. Dynamic Imports & Lazy Loading!

webpack 提供一种很酷炫的功能，那就是运行时加载。使用webpack  实现运行时加载很简单，只需要两个步骤

1. 将需要运行时加载的 module, 使用 `dynamic import` 的方式 引入包

   > webpack 会编译阶段提前将 这个动态依赖模块打包成单独的 chunk, 在 runtime的时候按需加载

   > Angular等框架实现 route - lazyload的前置条件！

2. 配置 `webpack.config.json`



#### 1. 配置文件

`webpack.config.js`

```js
module.exports = {
  entry: {
    main: __dirname + '/app/main.js',
    user: __dirname + '/app/user-module/user.module.js'
  },
  output: {
    path: __dirname + '/build', 
    filename: '[name].bundle-[hash].js',   // 1.1 entry 中的 bundle
    // chunkFilename 专门管那些不在 entry 中的bundle, 也就是dynamic import bundle
    chunkFilename: '[name].dynamic-bundle-[hash].js'   // 1.2 动态 依赖的 bundle
  },
  ...
  module: {
    rules: [{
      test: /\.js(x?)$/, 
      use: {
        loader: "babel-loader",  // 1.3 babel 解析动态加载语法
      },
      exclude: /node_modules/
   }]
  ...
  resolve: {
    alias: {
      share: __dirname + '/app/shared-module/shared.module.js'  // 1.4 alias 为动态加载提供别名
    }
  },
  ...
}
```

`share.js`

```js
export data = {name: 'abc', age: 50}
```

`.babelrc`

```json
{
    "presets": [
            "env"
        ],
    "plugins": ["syntax-dynamic-import"],
    "comments": true
}
```



#### 2. 动态加载

* 动态加载

  `main.js` 中动态引入 `shared.js`

  ```js
  btn.onclick => () => {
      import(
      /* webpackChunkName: "share" */
      'share'
      ).then(data => console.log(data));  // {name: 'abc', age: 50}
  }
  ```

  * dynamic import 特性还不在标准的 babel 包中，因此需要 一个 babel-plugin来处理
    * `npm install --save-dev babel-plugin-syntax-dynamic-import`
    * `.babelrc`  参考上面笔记
      * ❗️注意
        * plugin 中 引入 `syntax-dynamic-import` 解析动态加载的语法
        * `comments: true` 很关键，表示让babel 打包的时候不要删除 comment, 让 webpack-dynamic-import-magic-comment 发挥作用

* **magic comment - 注释的方式来配置 dynamic import**
    * 通过 `/* webpackChunkName: "share" */`  注释的方式，让动态加载包的名字，注入到 `output.chunkFileName` 中的 [name] 属性中去，生成的动态包被命名为

      > share.dynamic-bundle-b91155aef0b1c070e939.js

      方便调试

* 还有一种动态加载的方式 import - async 的方法

    ```js
    btn.onclick => () => {
        const _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
        console.log(_);
    }
    ```

    * 肯定需要额外 babel 预处理，需要一些 plugin



#### 2.2 效果

打开 dev-network panel

1. 浏览器先加载

> main.bundle-b91155aef0b1c070e939.js
>
> user.bundle-b91155aef0b1c070e939.js

2. 点击按钮，动态模块被请求载入

> 加载 share.dynamic-bundle-b91155aef0b1c070e939.js

如果再在其他包中动态引入 `shared.js` 浏览器就不会请求新资源了，因为该包已经被缓存了



#### 3. Magic Comment

```js
import (
    /* webpackChunkName: "share" */
    /* webpackPrefetch: true */
    /* webpackMode: "lazy" */
    'sharedModule'
  ).then(variable => {
    console.log(variable);
  }).catch(error => {console.log(error)});
```

可以通过 comment 对 dynamic import 进行配置

* `webpackChunkName: "share"` 配合  `output.chunkFilename` 对 动态包进行命名

   * `output.chunkFileName` 负责所有的 non-entry chunk

* `webpackMode: "lazy"`  默认就是 lazy，意思是 该包之后会通过 request 的方式被加载，不会被提前加载

   > webpackMode: "eager"  会提前将动态加载的模块打包入依赖模块，失去动态的特点

* `webpackPrefetch: true` 这个特性就酷炫了，当父包加载完毕后，浏览器利用 idle 时间，加载(prefetch)

* 还有 `webpackPreload` 属性，小心使用



如果配置了 `webpackPrefetch: true` 大概加载流程如下

1. 打开 app

> 加载 main.bundle.js
>
> 加载 user.bundle.js
>
> 结束, 浏览器进入  idle 期
>
> prefetch shared.dynamic-bundle.js

2.  点击按钮

> 加载 shared.dynamic-bundle.js



参考：[官方文档](https://webpack.js.org/guides/code-splitting/)

