# 进阶 清虚末期



## 1. 零碎配置



#### 1. HTML-Webpack-Plugin

* HTML-Webpack-Plugin 对 index.html 的环境配置注入

  * `index.temp.html`

    ```html
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title><%= htmlWebpackPlugin.options.title %></title>
      </head>
    
      <body>
        <h1> <%= htmlWebpackPlugin.options.myPageHeader %> </h1>
        <h3>Welcome to the Awesome application</h3>
        
        <my-app></my-app>
    
      </body>
    </html>
    ```

    * `<%= htmlWebpackPlugin.options.myPageHeader %>`  的注入方式

  * `webpack.config.js`

    * 再通过配置文件注入信息到模板中

    * ```js
      const HtmlWebpackPlugin = require('html-webpack-plugin');
      ...
          plugins: [
              new HtmlWebpackPlugin({
                  hash: true,
                  title: 'My Awesome application',
                  myPageHeader: 'Hello World',
                  template: '/app/index.tmpl.html',
                  filename: './build/index.html' // 生成HTML地址
              })
         ]
      ...
      ...
      ```




#### 2. Resolve - 简化 es6 import 的依赖寻路

1. 默认依赖模块的后缀名

* `webpack.config.js`

  ```javascript
  ...
  ...
      ....
      entry: "./app/main.js", 
      output: {
          path: __dirname + "/build", //打包后的文件存放的地方
          filename: "bundle-[hash].js"
      },
      watch:true,
      resolve: { extensions: [".js", ".ts"] },
      .....
      .....
  ...
  ...
  ```

* `main.js`

  ```javascript
  // 省去写后缀的麻烦
  // 之前使用：import * from './greeter.js'
  
  import * from './greeter'
  ```

> Webpack 4+ 已经**自动**支持这个功能了



2. **resolve-alias 昵称功能**，指明路径

   - `webpack.config.js`

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

   - 直接在项目代码中使用

     ```js
     // main.js
     import {...} from 'react';
     import {...} from 'Utilities';
     ```

     - 不用自己写 path，和 `import {HttpModule} from '@angular/commmon'`  相似



#### 3. HRM  Hot-Replacement-Module

热加载(不刷新页面，websocket的方式push 更新)

* `package.json`

  ```json
  "scripts": {
      "server": "webpack-dev-server --hot --inline",
      ...
    },
  ```

  > 需要Debug

* Hot-Replacement-Module 绝不要用在 Production中

[原理参考<websocket>](https://medium.com/@rajaraodv/webpack-hot-module-replacement-hmr-e756a726a07)



## 2. Multiple Entries

#### 1. Multiple Entries

这一点是实现当今框架懒加载模块的前提，多个大的 module 相互不依赖，通过 webpack `multiple entry` 的方式生成多个 `bundle`, 适当时候再将他们引进 `index.html`

* 依赖图

  ```mermaid
  graph LR
      B["Root"]
      B-->C[index.html]
      B-->D[main.js]
      B-->E[user.js]	
     	D-->|依赖|F[lots of js files]
     	E-->|依赖|G[lots of js files]
     	B-.->|待生成|H(build)
     	H-.->I[main.bundle-hash.js]
     	H-.->J[user.bundle-hash.js]
  ```

* `webpack.config.js`

  ```js
  module.exports = {
    entry: {
      main: './main.js',
      other: './user.js'，
      // 全局 css style
      style: [
        '..../primeng.css',
        '..../primeng-custom.css'
      ]
    },
    output: {
      path: __dirname + '/build', 
      filename: '[name].bundle-[hash].js'
    },
    ....
    ....
  }
  ```

  * name 代表 `entry` 中的 key
  * hash 生成唯一 bundle hash 值，用于缓存

> 如果安装了 HTML-Webpack-Plugin 插件，index.html会中自动引入两个 `bundle.js`， 或者自己配置该插件的 `chunks` ， 自定义引入的块

  

* By-the-way: 手动引入 `package.json` 中的 dependencies

  > 其实并不需要这么做，因为在项目代码中，某些js 文件引入了 dependencies, 那么webpack打包的时候，就自动将这些依赖dependencies 打包了

  ```javascript
  const package = require('../package.json');
  
  module.exports = {
    entry: {
      main: './app/main.js',
      vendor: Object.keys(package.dependencies)
    },
    output: {
      path: __dirname + '/build', 
      filename: '[name].bundle-[hash].js' 
    },
    ....
    ....
  }
  ```

  * **注意：** 如果app.js 中有代码依赖了 package.json中的文件，这样的方法相当于打包了两次 package.json中的依赖代码



#### 2. Multiple Pages Applications

如果我们想生成了多个 `bundle.js`, 在multiple pages applications 中，不同的`html` 文件引入 不同的 `[name]-bundle-hash.js` 

- 结构

  ```mermaid
  graph LR
      B["Root"]
      B-->C[index.html]
      B-->D[user.html]
      C-->E[main.bundle-hash.js]	
     	D-->F[user.bundle-hash.js]
  ```

- 关键是 配置好 **HTML-Webpack-Plugin**

  生成两个有不同依赖的 `html`

  `webpack.config.js`

  ```javascript
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  
  module.exports = {
      entry: {
          main: './app/main.js',
          user: './app/user.js'
      }, 
      output: {
           path: __dirname + '/build', 
      	filename: '[name].bundle-[hash].js'
      },
  	...
      plugins: [
          new HtmlWebpackPlugin({
              ...
      	    template: '/app/index.tmpl.html'
              chunks: ['main'],
              filename: './build/index.html' //relative to root of the application
          }),
          new HtmlWebpackPlugin({
              ...
              template: '/app/index.tmpl.html',
              chunks: ['user'],
              filename: './build/user.html' 
          })
     ]
  
  }
  ```

  - `chunks` 中规定包含的 bundle 的 `name`
  - `filename` 表示最后生成的html文件



## 3. Common-chunk

> 处理大文件，共享文件

> 为 框架的 lazy-loading 铺路

#### 1. 问题所在

* 结构

  ```mermaid
  graph LR
      B["Root"]
      B-->|引入main.js 和/user.js|C[index.html]
      B-->D[main.js]
      B-->E[/user-module/user.js]	
     	D-->|依赖|F[/shared-module/shared.js]
     	E-->|依赖|F
  ```

  > `main.js` 和 `user.js` 是两个独立不依赖的文件

  * 如果按一般的 `webpack.config` 配置

    * `index.html` 会引入 `main.js` 和 `user.js`
    * 浏览器加载的 `main.js` 包含 `shared.js`,  浏览器加载的`user.js` 包含 `shared.js` 的所有代码。

  * 打开 chrome - network 调式

    > main.bundle-[hash].js
    >
    > user.bundle-[hash].js

    > 两个bundle 中都包含全部 shared.js 代码，相当于引入了两次

  * 我们期待的行为应该是，作为共享依赖，应该只在**第一次引入的时候被加载**， 后面如果有相同模块加载，浏览器不应该再发送请求，而是寻找cache中的该模块。

* 解决办法： 将 shared 模块单独包装成 一个 chunk(bundle), 保证只在第一次被引入的时候加载，之后再被引入的时候，浏览器直接从cache中找这个 chunk。



#### 2. 方法

* 如果碰到以下的一些情况，我们可以考虑把代码打包成单独的 chunk(bundle):
  *  node_modules中被引用的依赖
  * 被 多次引用的 依赖（shared）
  * 大于30kb的依赖
  * ....

* 配置 `webpack.config.js` 的 `optimization` , 相关plugin的名称是： `SplitChunksPlugin` 

  > 当然配合 `HTML-Webpack-Plugin` 使用会更舒适

  * 参考：[SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin/#splitchunks-minchunks),  [Tutorial](https://wanago.io/2018/06/04/code-splitting-with-splitchunksplugin-in-webpack-4/)

* 结构

  ```mermaid
  graph LR
      B["Root"]
      B-->|引入main.js 和/user.js|C[index.html]
      B-->D[main.js]
      B-->E[/user-module/user.js]	
     	D-->|依赖|F[/shared-module/shared.js]
     	D-->|依赖|G[/node_modules/lodash.js]
     	E-->|依赖|F
  ```

* 思想 

  * 项目代码相关 `shared-module`中的依赖 打包成一个 chunk(bundle)
  * /node_modules/ 中的依赖 打包成另外一个 chunk(bundle)

* `webpack.config.js`

  ```js
  module.exports = {
    entry: {
      main: __dirname + '/app/main.js',
      user: __dirname + '/app/user-module/user.module.js'
    },
    output: {
      path: __dirname + '/build', //打包后的文件存放的地方
      filename: "[name].bundle-[hash].js"
    },
    ...
    plugins: [
      new HtmlWebpackPlugin({
        template: __dirname + "/app/index.tmpl.html",
        chunks: ['main', 'user', 'vendors', 'shared'],
      }),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          shared: {
            test: /[\\/]shared-module[\\/]/,
            name: 'shared',
            chunks: 'all',
            minSize: 0,
          }
        }
      }
    }
  }
  ```

  * 关键在于配置`optimization` 中的 `splitChunks`属性 （webpack4 内置）

  * `cacheGroups`中的key 都相应的依赖被打包成的单独的 `chunk`

  * 

  * ```js
    commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            },
    ```

    * test: 表示匹配规则，[\\\/] 匹配的是 /, 也就是说 test那一行匹配 `/node_modules/` ，所有的node_modules中被引入的依赖都归于这个chunk

    * name: 这个`chunk` 的名字，需要被引入 `index.html`, 这里我们通过 `HtmlWebpackPlugin` 实现

    * chunks: 'all', 异步方式(dynamic import)和同步都可以引入该chunk,

      ⚠️注意 `cachesGroup.chunks` 是 非省略项，必须显示申明

      * initial ，同步引入
      * async,  动态引入

  * 

    ```js
    shared: {
              test: /[\\/]shared-module[\\/]/,
              name: 'shared',
              chunks: 'all',
              minSize: 0,
            }
    ```

    * test: 打包所有的 share-module 中的依赖到一个 chunk
    * minSize: 0 / 这里需要单独规定文件最小size 为0 就可以打包进入这个 `chunk` ，因为该优化默认是 `minSize: 30000` (30kb)，意味着大于30kb的文件才被单独打包进这个`chunk` , 我们的 `shared.js` 没这么大，必须加上 `minSize: 0` 才能被打包进这个单独的 chunk

  * 注意 `HTML-Webpack-Plugin` 第一次启动，就引入相关模块（懒加载之后再解析）

* 其他参数

  * `maxInitialRequest` 
  * `minChunks` : 依赖被引用几次以上，我们就单独打包该依赖到 本chunk，`default === 2 ?`

* 结果

  * chrome-web pannel

    > main.bundle-[hash].js
    >
    > user.bundle-[hash].js
    >
    > shared.bundle-[hash].js
    >
    > vendors.bundle-[hash].js

  * `main.js` 和 `user.js` 不包含 `lodash.js` 和`shared.js` 的代码

  * `shared.js` 和 `lodash.js` 保证只被载入一次（首次引入的时候加载）



####3. 将 指定的 第三方库/共享依赖 单独打包

比如我们只想将 `Jquery` 打包进 `vendors.bundle` ，不将 `node_modules` 中的其他依赖单独打包到 `vendors.bundle` 中

* `webpack.config.js`

  ```js
  entry: {
    vendors: ['jquery'],
    main: './app/main.js',
  },
  output: {
    path: path.join(__dirname, '/build'),
    filename: '[name]-[hash].bundle.js',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          test: 'vendors',
          name: 'vendors'
        },
      }
    },
  }
  ```

  * `splitChunks-cacheGroups` 中的 `test` 匹配 **entry中的键值key**
  * 一般来说，按照之前讲的，entry 中的 值，代表的应该都是那些不再被引用的某块，但这里，我们特别声明了 一个 共用模块(jquery)在entry中，并在splitChunks 优化它（单独打包成一个chunk, App整个生命周期只被引入一次，达到shared的目的）。



#### 4. splitChunks  还可以进行更精细的操作

* `webpack.config.js`

  可以指定忽略某个 chunk

  ```js
  module.exports = {
    //...
    optimization: {
      splitChunks: {
        chunks (chunk) {
          // exclude `my-excluded-chunk`
          return chunk.name !== 'my-excluded-chunk';
        }
      }
    }
  };
  ```


 

## 4. \<link> for style

之前我们已经可以使用 `style.loader` , `css-loader ` 和 `sass-loader` 很好的

* 编译sass 文件
* 引入css依赖 到 `html`

但是该方法最后的结果是，将 css 通过 `<style>` 引入`index.html`, 如果css庞大的话，那么`index.html` 是非常难看的



* 解决方法

  * 将所有的 `.css` 单独打包成一个 chunk, 再通过 `<link>` 外部链接的方式，引入 `index.html` 中

* 实践 - MiniCssExtractPlugin

  > 相关插件 `ExtractTextPlugin` 已经不再适合  webpack 4.0+ 了，使用`mini-css-extract-plugin`

  > This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS and SourceMaps.

  * `webpack.config.js`

    ```javascript
    ...
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    
    module.exports = {
      ...
      module: {
        ...
        {
          test: /(\.(s?)css|\.sass)$/,
          use: [{
              loader: MiniCssExtractPlugin.loader,
              options: {
                // you can specify a publicPath here
                // by default it use publicPath in webpackOptions.output
                // publicPath: '../'
              }
            },
            'css-loader',
            'sass-loader'
          ],
          exclude: /node_modules/
        }]
      },
      plugins: [
        ...
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: "[name].css",
          chunkFilename: "[id].css"
        })
      ],
      ...
    }
    ```

    * `plugin` 中引入 `MiniCssExtractPlugin`
    * `loader`中配置，其实可以看出我们这里只是将 `style-loader` 替换成了该 `MiniCssExtractPlugin`, 换了一种输出的方式
      * 之前该有的 `css-loader` 和 `sass-loader` 还是存在
      * 它们的输出结果被 `MiniCssExtractPlugin` 处理

* 结果

  * 所有的css依赖被打包成一个包，被 `index.html` `<link hre=..>` 的方式引入了。



## 5. Image/File 的打包处理



#### 1. 小Image文件

> 针对size 很小的 image, 我们可以将它转换成 `base64-string`, 这样的好处是，不用单独再发送一个 image的请求，image被自动嵌入到了HTML中。但是转换成 base64 之后的 image size其实是变大了，因此该方法适用于 小的一些 icon/image

* 使用webpack将小size` image` 打包成 base64 string

  * `url-loader`

    * `npm install url-loader --save-dev`

  * `webpack.config.json`

    ```js
    const webpack = require('webpack');
    ...
    
    module.exports = {
      ...
      module: {
        rules: [{
          test: /\.(png|jp(e*)g|svg)$/,
          use: [{
              loader: 'url-loader',
              options: {
                  limit: 20000, // Convert images < 20kb to base64 strings
              }
          }]
        }]
      },
      plugins: ....
      ....
    }
    ```

    * limit 限制20000byte 以下的文件会通过 `url-loader` 转换成 `base64 string`

  * 将图片image 引入 css 或者 js 形成关联（依赖）

    * `.js`

      ```javascript
      import buildingImg from '../assets/images/buildings.png';
      const imgEl = document.createElement('img');
      imgEl.src = buildingImg;
      document.body.appendChild(imgEl);
      ```

      * **注意**： `import x from '...'` 表示import default

      > 这种关联的方式其实就是框架的方式？



      * .css`

      ```css
      body {
          background-image: url('../assets/images/home.png');
      }
      ```


#### 2. Image 过大

* 如果 image 大于 `url-loader` 规定的大小，那么它就会自动默认被 `webpack` - `file-loader` 捕获，并处理
* 当然用户也可以去手动配置这个`file-loader`

 



## 6. Environment Flag

让一些 code 只在特定的 environment 下运行 (例如：Dev)。这时候需要自定义一个 `Plugin`

* 安装 `npm install --save-dev cross-env`

* `webpack.config.json`

  ```js
  const webpack = require('webpack');
  
  const devFlagPlugin = new webpack.DefinePlugin({
    __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
  });
  
  module.exports = {
    entry: './main.js',
    output: {
      filename: 'bundle.js'
    },
    plugins: [devFlagPlugin]
  };
  ```

  * 自己定义 `devFlagPlugin` 并引入

* `package.json`  命令行指定运行环境，相当于 environment 的传参过程

  ```json
  {
    // ...
    "scripts": {
      "dev": "cross-env DEBUG=true webpack-dev-server --open",
    },
    // ...
  }
  ```


## 7.  ProvidePlugin - Expose

> 全局变量暴露法

假如我们想在任意 工程代码中都使用 `$(jQuery)` 的这个符号，而不需要每次都引入。我们就需要这个 Plugin

* `webpack.config.js`

  ```js
  ....
  plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
    ]
  ....
  ```

  * `identifier: ['module1', 'property1']` 的形式， 

    * _property1 是方便辨认包中不同的 export variables_

    * module1 需要提供模块的路径

      * 可以直接提供

        * `identifier: [__dirname + '/app/global.js']`

      * 当然更推荐用  alias 的方式来指明 (下一章笔记有记录)

        * `webpack.config.js`

          ```js
          resolve: {
              alias: {
                  global: __dirname + '/app/global.js'
              }
          }
          plugins: [
              new webpack.ProvidePlugin({
                global: 'global'
              })
            ]
          ....
          ```

* 使用 - `main.js`

  ```js
  // 这里不需要再引入jquery了
  $('#id').appendChild(...)
  ```




> 全局`global.js`被打包到， 引入全局文件的那个文件所在的 bundle 中，如果有多个 bundle 引入了全局文件，那么他们都重复的包含了全局文件的代码，因此尽量控制全局文件的大小



## 8. Exposing Global Variables

优化编译过程，在开发过程中，让某个依赖不被打包到任何一个 `bundle.js` 中，即不被 webpack 处理

* `webpack.config.js`

  ```js
  module.exports = {
    ...
    externals: {
      // 任意的全局变量
      data: {name: 'global'},
      // 不想被放进 bundle的 依赖
      jquery: 'jQuery'
    }
  };
  ```

* 使用

  * 通过 CDN 引入 Jquery

    `index.html`

    ```html
    <script
      src="https://code.jquery.com/jquery-3.1.0.js"
      integrity="sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk="
      crossorigin="anonymous">
    </script>
    ```

  * `main.js`

    ```js
    import $ from 'jquery';
    import data from 'data';
    
    console.log($);
    console.log(data);
    ```
