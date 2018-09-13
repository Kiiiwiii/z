## 1. 基础



#### 1.1 函数式编程 Function

```js
const oldArr = [1,2,3,4,5];
const newArr = oldArr.map(i => i + 1);
```

* 函数是一等公民，`i => i+1` 函数作为参数

* 用函数来描述行为 `arr.map().filter().find().....`

* Pure function 纯函数

  * 给定相同参数，一定返回相同结果 (内部不能有随机函数)

  * 不改变原函数（无副作用），`oldArr` 不允许被改变

  * 不使用函数之外的变量

    ```js
    // 使用了函数之外的变量，非纯净
    const a = 5;
    button.addEventListener('click', () => {
        console.log(a);
    })
    ```



#### 1.2 推拉模型

* 概览

  |          | 生产者                             | 消费者                             |
  | -------- | ---------------------------------- | ---------------------------------- |
  | **拉取** | **被动的:** 当被请求时产生数据。   | **主动的:** 决定何时请求数据。     |
  | **推送** | **主动的:** 按自己的节奏产生数据。 | **被动的:** 对收到的数据做出反应。 |

* 示例

  * 拉取模型

    * js function 是拉取模型，函数会生产值(return)，消费者调用的时候才获得值
    * Generator 是拉取模型，靠函数内部生产值，消费者(it.next) 消费的时候获得值

  * 推送模型

    * Promise 注册消费者，生产者产生数据(resolve)的时候告知消费者(then中的 callback)
    * Observable 消费者被注册，生产者主动推送数据



#### 1.3 Observable vs. Promise

* 是否立即执行
  * Promise 实例会立即执行，就算没有注册过 回调函数
  * Observable 流中，只有等真正有 订阅者 订阅的时候，第一个数据才开启流的过程 （惰性）
* 是否发送多个值
  * Promise 只能进行一次状态改变
  * Observable 允许发出多个值
* 是否允许取消（在值发射前）
  * Promise 注册了就不能 注销
  * Observable 可以退订



## 2. 引入方式小记

* RxJS 5.5 之前

  * 先引进 observable, 再引入操作符

    `import {Observable} from 'rxjs/Observable'`

  * operators

    `import rxjs/add/operators/map`

  * creator

    `import rxjs/add/observable/of`

* RxJS 5.5 +

  > 不用再加入 Observable 前缀

  * operators

    `import {map} from rxjs/operators/map`

  * creator

    `import {of} from rxjs/observable/of`





## 3. 仿写

(待更新)

#### 3.1 Observable



#### 3.2 Subject

