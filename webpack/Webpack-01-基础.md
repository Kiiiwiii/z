## Webpack 入门

* 一句话：webpack 找到依赖代码，打包成一个或者多个 文件

  > I love building Angular applications. Because Angular is so modular you can separate your JavaScript code like your controllers and services into multiple files. But **adding all of the script references to my HTML file is painful**. If only there were some way to use a module loader similar to how modules work in Node…

  > **Browser 端的 Require.js ？**

![webpack01](/Users/Zhan_/Documents/Coding/Web/Javascript/JS_Learning/Javascript/Webpack/images/webpack01.png)





## 1. Webpack 基础

####1. 安装webpack 

> 全局安装，方便使用命令行指令 `webpack`

* `npm install -g webpack`

* `npm install -g webpack-cli`

  > webpack command line 工具

#### 2. 项目结构

* 目的：在 index.html 文件中 引入`依赖bundle.js`，通过webpack 自动把该`依赖bundle.js`生成（该依赖可能又依赖别的文件）

* 结构

  ```mermaid
  graph LR
      B["Root"]
      B-->C[app]
      B-->D[public];
      C-->E[main.js]
      C-->F[greeter.js]
      D-->G[index.html]
      D-->H[bundle.js 待生成]
      
      G-->|依赖|H
      H-->|依赖|E
      E-->|依赖|F
  ```

* 伪代码

  * index.html

    ```html
    <html>
        <div id='root'>
        </div>
    </html>
    <script src="bundle.js"></script>
    ```

  * main.js

    ```javascript
    const greeter = require('./Greeter.js');
    document.querySelector("#root").appendChild(greeter());
    ```

  * greeter.js

    ```javascript
    module.exports = function () {
      var greet = document.createElement('div');
      greet.textContent = "Hello World";
      return greet;
    };
    ```

  * bundle.js

    > webpack 生成

#### 3. webpack  编译

* 通过命令行编译

  `webpack {entry file} {destination for bundle file}`

  * `webpack app/main.js public/bundle.js`

    > 在webpack4 之后需要运行  
    >
    > `webpack {entry file} --output {destination} --mode development`

  * 这样bundle.js 就被生成了

* 每次用配置命令行，我们需要一个 配置文件

  * webpack.config.js

  * ```javascript
    module.exports = {
      entry: __dirname + "/app/main.js", //已多次提及的唯一入口文件
      output: {
        path: __dirname + "/public", //打包后的文件存放的地方
        filename: "bundle.js" //打包后输出文件的文件名
      }
    }
    ```

  * 命令行运行 `webpack`

* 融入npm

  ```json
  "scripts": {
      "start": "webpack",
      "command1": "echo abc"
    },
  ```

  * `start`  是npm 特殊命令，直接用 `npm start` 即可运行对应命令
  * 其他script 需要用 `npm run command `  的方式运行

* watch 观察文件变化，刷新webpack 终端

  * 只需在 `webpack.config.json` 中添加

    ```javascript
    module.exports = {
      ...
      watch: true
    }
    ```


#### 4. 多Entry的方式 - (补充内容)

*  `webpack.config.json`

  ```js
  module.exports = {
    entry: {
        vendors: ['jquery', 'lodash', 'react'],
        main: __dirname + '/app/main.js', //已多次提及的唯一入口文件
    }
  
    output: {
      path: __dirname + "/public", //打包后的文件存放的地方
      filename: '[name]-[hash].bundle.js' //打包后输出文件的文件名
    }
  }
  ```

  * 指定 第三方依赖: `vendors: ['jquery', 'lodash', 'react']`
  * 指定项目代码： `main: __dirname + '/app/main.js'`

## 2. Webpack 功能



#### 1. source map 方便调试

试想如果开发过程中，代码出错了，怎么debug呢。如果是之前我们写的 webpack配置文件，出错之后你只能找到 bundle.js中的错误，没办法给你反馈，编译前的源文件中哪儿出错了

* 抛出错误

  ```javascript
  // greeter.js
  throw new Error('abc');
  ```

  > 这时你打开浏览器调式，只能看到提示 `bundle.js` 哪儿错了，根本不知道是 `greeter.js` 有问题

* webpack 四个绘制 source map的方式

  | devtool选项                    | 配置结果                                                     |
  | ------------------------------ | ------------------------------------------------------------ |
  | `source-map`                   | 在一个单独的文件中产生一个完整且功能完全的文件。这个文件具有最好的`source map`，但是它会减慢打包速度； |
  | `cheap-module-source-map`      | 在一个单独的文件中生成一个不带列映射的`map`，不带列映射提高了打包速度，但是也使得浏览器开发者工具只能对应到具体的行，不能对应到具体的列（符号），会对调试造成不便； |
  | `eval-source-map`              | 使用`eval`打包源文件模块，在同一个文件中生成干净的完整的`source map`。这个选项可以在不影响构建速度的前提下生成完整的`sourcemap`，但是对打包后输出的JS文件的执行具有性能和安全的隐患。在开发阶段这是一个非常好的选项，在生产阶段则一定不要启用这个选项； |
  | `cheap-module-eval-source-map` | 这是在打包文件时最快的生成`source map`的方法，生成的`Source Map` 会和打包后的`JavaScript`文件同行显示，没有列映射，和`eval-source-map`选项具有相似的缺点； |
  |                                |                                                              |

  * 中小型项目 + **开发阶段** 适用： `eval-source-map`
  * 大型项目 + **开发阶段** 适用：`cheap-module-eval-source-map`

* webpack.config.js

  ```javascript
  module.exports = {
    devtool: 'eval-source-map', // 这一行指明source map 类型
    entry:  __dirname + "/app/main.js",
    output: {
      path: __dirname + "/public",
      filename: "bundle.js"
    }
  }
  ```



#### 2. 使用webpack构建本地服务器

监听源文件变化，刷新浏览器

* 安装 `npm install --save-dev webpack-dev-server`

  > 也需要安装 `npm install --save-dev webpack` 和 `npm install --save-dev webpack-cli`, 否则报错

* 配置选项参考

  | devserver的配置选项 | 功能描述                                                     |
  | ------------------- | ------------------------------------------------------------ |
  | contentBase         | 默认webpack-dev-server会为根文件夹提供本地服务器，如果想为另外一个目录下的文件提供本地服务器，应该在这里设置其所在目录（本例设置到“public"目录） |
  | port                | 设置默认监听端口，如果省略，默认为”8080“                     |
  | inline              | 设置为`true`，当源文件改变时会自动刷新页面                   |
  | historyApiFallback  | 在开发单页应用时非常有用，它依赖于HTML5 history API，如果设置为`true`，所有的跳转将指向index.html |

* 配置 webpack.config.js

  ```javascript
  devServer: {
      contentBase: "./public", //本地服务器所加载的页面所在的目录
      historyApiFallback: true, //不跳转
      inline: true //实时刷新
      port: 8080
    }
  ```

* 配置 package.json

  ```json
   "scripts": {
      "start": "webpack",
      "server": "webpack-dev-server --open"
    },
  ```

* 项目结构

  * 确认 `index.html` 在 `/public`  文件夹中
    * 配置 `HTML Webpack Plugin ` 插件路径
  * 打包后的 `chunk` : `[name].bundle.js` 等也在public文件夹中
    * 配置 webpack config 的`entry` 和 `output`

* 运行webpack 服务器，发现public 文件夹没有东西，因为文件都被缓存到了 memory中，因此找不到相关文件



## 3.1 Webpack Loader

Loader 使得webpack 可以调用外部脚本，实现文件编译以及转换。

* ES6/7 > ES5
* SCSS > CSS



#### 1. 概况

Loaders需要单独安装并且需要在`webpack.config.js`中的`modules`关键字下进行配置，Loaders的配置包括以下几方面：

- `test`：一个用以匹配loaders所处理文件的拓展名的正则表达式（must）
- `loader`：loader的名称（must）且唯一
- `include/exclude`:手动添加必须处理的文件（文件夹）或屏蔽不需要处理的文件（文件夹）（optional）；
- `query`：为loaders提供额外的设置选项（optional）

 

#### 2. 通过Loader 配置 Babel

让Babel识别 ES6语法，React 语法

* 改写

  * main.js

    ```javascript
    import React from 'react';
    import {render} from 'react-dom';
    import Greeter from './Greeter';
    
    render(<Greeter />, document.getElementById('root'));
    ```

  * greeter.js

    ```javascript
    import React, {Component} from 'react'
    import config from './config.json';
    
    class Greeter extends Component{
      render() {
        return (
          <div>
            {config.greetText}
          </div>
        );
      }
    }
    export default Greeter
    ```

* npm install 所有依赖

  `npm install --save-dev babel-core babel-loader babel-preset-env babel-preset-react`

* 两种配置 `webpack.config.json` 的方式

  * 直接在 `webpack.config.json` 中配置 babel (不推荐，这样会让 webpack的配置文件硕大无比)

    ```javascript
    module: {
        rules: [{
          test: /(\.jsx|\.js)$/, // $ 匹配end of string
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "env", "react"
              ]
            }
          },
          exclude: /node_modules/
        }]
      }
    ```

  * 分离成 `webpack.config.json` 和 `.babelrc`

    * `webpack.config.json`

      ```javascript
      module: {
              rules: [
                  {
                      test: /(\.jsx|\.js)$/, // $ 匹配end of string
                      use: {
                          loader: "babel-loader"
                      },
                      exclude: /node_modules/
                  }
              ]
          }
      ```

    * `.babelrc`

      ```javascript
      //.babelrc
      {
        "presets": ["react", "env"]
      }
      ```


## 3.2 Webpack Loader 一切皆模块

所有文件都被当作模块处理 (最后转换成一个 **`bundle.js`** ?)，不论是 `.js` `.css` 还是图片等等

> Loader 在 webpack 打包之前，对一些文件进行预处理，方便webpack 打包

#### 1. CSS + Webpack

> Take away
>
> 1. entry 依赖 css 文件
> 2. node install 并在 webpack.config.js 中配置 css-loader 和 style-loader

* 首先需要明确的是，我们需要有一种方法，能让该 `css` 文件和 `main.js` 挂上联系，这样 `webpack` 才能通过 `main.js` 这个唯一的入口(entry) 找到 css

* 代码结构

  ```mermaid
  graph LR
      B["Root"]
      B-->C[app]
      B-->D[public];
      C-->E[main.js]
      C-->F[main.css]
      D-->G[index.html]
      D-->H[bundle.js 待生成]
      
      G-->|依赖|H
      H-->|依赖|E
      E-->|依赖|F
  ```

* `main.js` 引入依赖 `main.css`

  ```javascript
  //main.js
  import React from 'react';
  import {render} from 'react-dom';
  import Greeter from './Greeter';
  
  import './main.css';//使用require导入css文件
  
  render(<Greeter />, document.getElementById('root'));
  ```

  * 通过 `import`, `require`, `url`等 建立与css 文件的关联

  * 如果此时 调用 `webpack` 命令，会得到以下错误。这是因为 Webpack 默认依赖应该是一个 `javascript module` , 而这里依赖了一个 `css` 文件，因此这时需要一个合适的 `loader` 去转换 `css` 到 `javascript`

    > Module parse failed: Unexpected token (2:5)
    > You may need an appropriate loader to handle this file type.
    > | /* main.css */

* webpack 引入 `css-loader`

  * `npm install --save-dev css-loader`

  * `webpack.config.js`

    ```javascript
    module.exports = {
        entry: ...,
        output: ...,
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ['css-loader']
                }
            ]
        }
    ```

  * 这个时候运行 `webpack`

    * 你可以发现 `main.css` 也被bundle 进去了。
    * 如果你还想知道有哪些 `node-modules` 被bundled的话，可以使用 `webpack  --display-modules`
      * 这样你可以发现 `~node-modules/css-loader` 也在其中

  * 打开网页，结果发现 style 并没有附上，原因如下

    * `css-loader` 只负责将 `css` 转化为合理的 `javascript string`

      > exportedStyles = [
      > ​    // specified in the styles.css
      > ​    "span {\r\n   color: green;\r\n}",
      >
      > // imported from the app/header.css
      > "header span {\r\n   color: blue;\r\n}"
      >
      > ];

    * 需要另外一个 loader，将这些 string 重新变回 `<style>` 

* webpack 引入 `style-loader`

  * `npm install style-loader --save-dev`

  * `webpack.config.js`

    ```javascript
    module.exports = {
        entry: ...,
        output: ...,
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        "style-loader",
                        "css-loader"
                    ]
                }
            ]
        }
    ```

    > style-loader 如果放在 css-loader 之后会报错，因为顺序代表 input / output，即以 css-loader 的output 作为 style-loader 的 input。 这里的 script 是 反序了的

  * Bingo

额外参考：[webpack-css-in-angular](https://blog.angularindepth.com/this-is-how-angular-cli-webpack-delivers-your-css-styles-to-the-client-d4adf15c4975)



#### 2. SCSS/SASS + Webpack

根据上一节的经验，这一次应该很清楚了，我们需要一个 **loader** 将`scss/sass` 转化为 `css`

* entry 关联 `sass` 文件

  ```javascript
  // main.js
  ...
  import './style.sass';
  ...
  ```

* 引入 `sass-loader`

  * `npm install sass-loader node-sass --save-dev`

  * `webpack.config.js`

    ```javascript
    module: {
        rules: [{...
          ,{
          test: /(\.css|\.sass)$/,
          use: [
            "style-loader",
            "css-loader",
            "sass-loader"
          ]
        }]
    ```

    > use 中的顺序代表 后位的输出当前一位的输入，很重要

参考：[阿三讲webpack](https://medium.com/a-beginners-guide-for-webpack-2/using-sass-9f52e447c5ae)



#### 3. CSS Module + Webpack

前端css 模块化与 webpack

* `webpack.config.json`

  ```javascript
  use: [
      {
          loader: "style-loader"
      }, {
          loader: "css-loader",
          options: {
              modules: true, // 指定启用css modules
              localIdentName: '[name]__[local]--[hash:base64:5]' // 指定css的类名格式
          }
      }
  ]
  ```

* `greeter.js`

  ```javascript
  import React, {Component} from 'react';
  import config from './config.json';
  import styles from './Greeter.css';//导入
  
  class Greeter extends Component{
    render() {
      return (
        <div className={styles.root}> //使用cssModule添加类名的方法
          {config.greetText}
        </div>
      );
    }
  }
  
  export default Greeter
  ```

查看：[webpack 入门](https://segmentfault.com/a/1190000006178770)



#### 4. PostCSS  浏览器前缀loader

使用 `postcss-loader` 和 `autoprefixer` ， 这样生成的 css 就可以自动添加 css 浏览器前缀



## 4. Plugin 插件

> "插件（Plugins）是用来拓展Webpack功能的，它们会在整个构建过程中生效，执行相关的任务。 Loaders和Plugins常常被弄混，但是他们其实是完全不同的东西，可以这么来说，loaders是在打包构建过程中用来处理源文件的（JSX，Scss，Less..），一次处理一个，插件并不直接操作单个文件，它直接对整个构建过程其作用。"



#### 1. Plugin 的基本使用方法

> Plugin分为 webpack 内置或者第三方

* webpack内置 plugin

  * `webpack.config.json`

    ```javascript
    const webpack = require('webpack');
    
    module.exports = {
    ...
        ...
        plugins: [
            new webpack.BannerPlugin('版权所有，翻版必究')
        ],
    };
    ```

    > 该Plugin给 `bundle.js` 自动添加了水印



#### 2. ⚠️ 热门插件大甩卖 

* HtmlWebpackPlugin (第三方)

  根据每次bundle的结果，自动生成一个引入该 `bundle.js` 的 index.html

  * `npm install --save-dev html-webpack-plugin`

  * 该html 需要一个模板, `index.tmpl.html`

    ```html
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Webpack Sample Project</title>
      </head>
      <body>
        <div id='root'>
        </div>
      </body>
    </html>
    ```

  * 更新 `webpack.config.js`



    ```javascript
    const webpack = require('webpack');
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    
    module.exports = {
        entry: __dirname + "/app/main.js",//已多次提及的唯一入口文件
        output: {
            path: __dirname + "/build",
            filename: "bundle.js"
        },
        ...
        plugins: [
            new webpack.BannerPlugin('版权所有，翻版必究'),
            new HtmlWebpackPlugin({
                template: __dirname + "/app/index.tmpl.html"//new 一个这个插件的实例，并传入相关的参数	
        	   path: '...',
        	   filename: '...'
            })
        ],
    };
    ```

    * 在 config 中引入该插件
    * plugin中，新建实例并传入 参数（模板对象）

* Hot Module Replacement 

  > `Hot Module Replacement`（HMR）也是webpack里很有用的一个插件，它允许你在修改组件代码后，自动刷新实时预览修改后的效果。



* BundleAnalyzerPlugin

  ![Screen Shot 2018-07-21 at 5.07.50 PM](/Users/Zhan_/Desktop/Screen Shot 2018-07-21 at 5.07.50 PM.png)

  * 

    * `npm install --save-dev webpack-bundle-analyzer`
    * `webpack.config.js`

    ```js
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    
    plugins: [
        ...
        new BundleAnalyzerPlugin({
          openAnalyzer: false
        })
        ...
      ],
    ```




## 5.  产品发布阶段



#### 1. 优化 `webpack.config.js` 配置

实现 Prod Mode 下面的 webpack 打包

* `webpack.config.json`

```javascript
// webpack.production.config.js
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    ...
    devtool: 'null', //注意修改了这里，这能大大压缩我们的打包代码
    ...
};
```

* `package.json` 简化指令

  ```json
  {
    ...
    "scripts": {
      ...
      "build": "NODE_ENV=production webpack --config ./webpack.production.config.js --progress"
    },
    ...
  }
  ```



#### 2. 优化插件

webpack提供了一些在发布阶段非常有用的优化插件，它们大多来自于webpack社区，可以通过npm安装，通过以下插件可以完成产品发布阶段所需的功能



- `OccurenceOrderPlugin` :为组件分配ID，通过这个插件webpack可以分析和优先考虑使用最多的模块，并为它们分配最小的ID

  - 第三方插件: `npm install --save-dev extract-text-webpack-plugin`

  - `webpack.config.js`

    ```javascript
    const ExtractTextPlugin = require('extract-text-webpack-plugin');
    ...
    plugins: [
           ....
            new webpack.optimize.OccurrenceOrderPlugin(),
            ....
        ],
    ```

- `UglifyJsPlugin`：压缩JS代码；

  - 不再需要，因为webpack在prod 模式下面自动使用

  - 不在 prod 模式下面，可以如下配置`webpack.config.js`也可以达到 Uglify 压缩代码的效果

    ```javascript
    module.exports = {
      //...
      optimization: {
        minimize: false
      }
    };
    ```

- `ExtractTextPlugin`：分离CSS和JS文件

  > webpack4 中 已经被替换成了 `mini-css-extract-plugin`



#### 3. 缓存

* 如何使用缓存

  缓存无处不在，使用缓存的最好方法是保证你的文件名和文件内容是匹配的（内容改变，名称相应改变）webpack可以把一个哈希值添加到打包的文件名中，使用方法如下,添加特殊的字符串混合体（[name], [id] and [hash]）到输出文件名前

  * `webpack.config.js`

    ```javascript
    const webpack = require('webpack');
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const ExtractTextPlugin = require('extract-text-webpack-plugin');
    
    module.exports = {
    ..
        output: {
            path: __dirname + "/build",
            filename: "bundle-[hash].js"
        },
       ...
    };
    ```

  * 这样每一次都生成一个  bundle-hashcode.js 文件了

* 清理之前缓存

  利用 `clean-webpack-plugin` 可以达到这个效果

  * `npm install clean-webpack-plugin --save-dev`

  * `webpack.config.js`

    ```js
    const CleanWebpackPlugin = require("clean-webpack-plugin");
      plugins: [
        ...// 这里是之前配置的其它各种插件
        new CleanWebpackPlugin('build/*.*', {
          root: __dirname,
          verbose: true,
          dry: false
      })
      ]
    ```



____



参考：[webpack-入门](https://segmentfault.com/a/1190000006178770)

