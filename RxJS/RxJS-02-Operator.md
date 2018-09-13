## 1. RxJS 5.5+ 新API



* let - 复用 observable pipeline pattern

  ```typescript
  // 定义pattern
  function pattern(keyword: string, dTime: number): (source: Observable<T>) => Observable<any | T> {
      return source => 
      	source.filter(...)
          .debounceTime(dTime)
          .map(...)
  }
               
  // 使用 let operator
  FormControl.valueChanges.let(pattern('abc', 500))...
  ```

* do - 流的过程中的 读取操作，不影响射出的值

  ```js
  Rx.Observable.of(1,2,3,4,5)
      .do(console.log)
      .map(...)
      .do(console.log)
      .filter(...)
      .subscribe(...)
  ```

* pipe 打包操作流程

  ```js
  of(1,2,3)
  .pipe(
  	map(i => i + 1),
      filter(i => i > 2),
      ....
  )
  ```

  * 在 pipe 中的 operator 需要使用 新的引入方式(不含Observable前缀的方式)
    * `import {map} from 'rxjs/operators/map'`



## 2. Creator

* create

  ```js
  const source = Observable.create((observer) => {
      // 同步射出值
      observer.next('1');
      // 异步射出值
      setTimeout(() => {
         observer.next('2');
      }, 1000);
  });
  
  const observer1 = {
      next: () => {},
      error: () => {},
      complete: () => {}
  }
  
  source.subscribe(observer1);
  ```

* of

  * `Observable.of(1,2,3)`
  * 每次发送一个参数
  * 参数发送完毕后，调用 订阅者 complete 方法

* from

  * `Observable.from(array)`
  * 将 array 元素 一个一个发送
  * complete

* fromEvent

  * `Observable.fromEvent(el, 'click')`
  * **不会 complete** 

* fromPromise

  ```JS
  function myPromise(){
      return new Promise(resolve => {
          console.log('1');
          resolve('3');
      });
  }
  
  Observable.fromPromise(myPromise()).subscribe(data => {
      console.log(data);
  })
  console.log('2')
  ```

  * **Promise 实例立即执行**！不论有没有订阅者
  * Promise 状态改变后，流 complete

* empty - 直接调用 订阅者 complete 方法

* never - 不发生任何事

* throw - `Observable.throw('error message')` 只调用 订阅者的 error 方法

* interval

  * `Observable.interval(x)`
  * 每隔 x ms，从 0 开始 射出 值（递增）
  * **不会 complete**

* timer

  * `Observable.timer(delay, x)`
  * delay ms 之后，射出第一个值  0，之后的方式与 interval 相同
  * **不会 complete**

* range - `range(1, 10)`





## 3. Operators

为了保证 operators 的链式效果，每个 operator的返回值都是 `Observable<returnValue>` 的形式



* repeat

  * `Observable.of(1,2,3).repeat(2)`
  * 省略参数代表执行无限次数

* scan - 类似于 `array.reduce`

  ```js
  Observable.of(1,2,3).scan((acc, next) => {...}, init)
  ```

* buffer

  * buffer - `observable1.buffer(observable2)` 缓存所有 observable1 的值，当 observable2 射出值后，将之前observable1的值 **同步一起射出**`[a,b,c]`
  * bufferTime(x)
  * bufferCount(x)

* startWith - `Observable.interval(1000).startWith(initValue)`

  * 订阅后，立即发送 initValue 值



#### map

* map

  ```js
  Observable.of(1).map(value => value + 1)
  ```

  * **可用于  通知流 > 信息流 的转换**

  * 例子: **鼠标拖拽效果**

    ```js
    // 通知流 - 鼠标按下 mousedown
    let mousedown = Rx.Observable.fromEvent(divEl, 'mousedown');
    // 信息流 - 鼠标移动 mousemove, 获取当前 cursor 位置
    let mousemove = Rx.Observable.fromEvent(body, 'mousemove');
    // 截断流 - 鼠标抬起 mouseup
    let mouseup = Rx.Observable.fromEvent(body, 'mouseup');
    
    mousedown.map(_ => mousemove.takeUntil(mouseup)).concatAll().subscribe(updateView);
    ```

* mapTo: 映射为统一值



#### 流合成

* concat - 合并流，**继发**

  ```js
  const stream1 = Rx.Observable.interval(100).take(2);
  const stream2 = Rx.Observable.of(2,3);
  stream1.concat(stream2).subscribe(console.log);
  
  // marble 图
  --0--1-(23)---
  ```

  * 前一个流如果是无限流，那么后面一个流永远不会开始

* merge - 合并流，**并发**

  ```js
  const stream1 = Rx.Observable.interval(300).take(4);
  const stream2 = Rx.Observable.interval(500).take(2);
  stream1.merge(stream2).subscribe(console.log);
  
  // marble 图
  stream1: --0--1--2--3
  stream2: ----0----1
  result:  --0-01--21-3
  ```

  * 值的性质相同 情况下的 并发：**要求订阅者不区别对待 这几个流的值**(与combineLatest 有区别)

* combineLatest - **并发**

  ```js
  const stream1 = Rx.Observable.interval(300).take(4);
  const stream2 = Rx.Observable.interval(500).take(2);
  stream1.combineLatest(stream2, (s1, s2) => ({s1, s2})).subscribe(console.log);
  
  // marble 图
  stream1: --0--1--2--3--
  stream2: ----0----1----
  result:  ----**--**-*--  // {0,0}, {1,0}, {2,0}, {2,1}, {3,1}
  ```

  * 整体流的射出条件：所有子流至少射出过一次 (都有 latest 值)
  * 当所有子流都有 latest 的值后，只要任意子流射出值，整体流就射出
  * callback 中可以获取所有子流的 latest 值
    * **可以 区别对待 子流的值**
    * 例子：表格可以被不同 filter(category, source, title) 更新，当任意一个 filter 改变，表格就被更新。这个时候就可以把 categoryChange, souceChange 和 titleChange 合并成一个，保证首次加载表格只被请求一次

  > 当前版本 combineLatest 整体流射出的时候，无法知道 对应是哪个子流射出了

* zip 相同顺位射出

  ```js
  source.zip(stream1, (s1,s2) => {....}).subscribe(....)
  
  // marble 图
  source: ---1-----2--------3------4------5
  stream: -----a-------b--c---------d---|
  
  result: -----1a-----2b----3c------4d--|
  ```

  * 相同顺位 的值一起 输出（等待）

  * 最短的 stream 结束，整个流就结束

  * 可能有内存泄露的问题

  * 应用：同步变异步

    ```js
    Rx.Observable.from('abcde').zip(Rx.Observable.interval(1000), (x, y) => x)...
    // 输出: a---b---c---d---e
    ```

* withLatestFrom

  ```js
  mainStream.withLatestFrom(subStream, (x, y) => {...})....
  ```

  * 集合所有流的 latest 值
  * 只有当 mainStream 射出的时候，整体流 才射出 main value + latest sub value
    * 如果 只是subStream 射出， 那么只是不停更新 subStream 的 latest value
  * 如果 main 射出值的时候，subStream 没有射出过 (没有 latest value)，该 main 射出的值被忽略



#### 高阶流转低阶

* concatAll  **继发，排队**

  * 基础用法

    ```js
    Rx.Observable.of(1).map(d => Observable.of(1)).concatAll().subscribe(console.log);
    ```

    * `map(d => Observable.of(1))` 返回的是 Observable\<Observable\<number>> ，需要解掉一层Observable

  * concatAll 排队效果

    * 无concatAll 的情况

      ```js
      Rx.Observable.of(1, 2)
          .map(x => Rx.Observable.interval(1000).take(3))
          .subscribe(insideObservable => {
          insideObservable.subscribe(d => console.log(d));
      });
      // marble 图
      ----00----11---22--------
      ```

      * `Rx.Observable.of(1,2)` 同时射出两个值，立马通过 map operator 转化为，两个几乎同时开始的interval(1000)
      * 因此是 00, 11, 22

    * concatAll 排队

      ```js
      Rx.Observable.of(1, 2)
          .map(x => Rx.Observable.interval(1000).take(3))
          .concatAll()
          .subscribe(d => console.log(d));
      
      // marble 图
      ----0----1----2----0----1----2---
      ```

      * 前一个 内层的 observable 没有结束，下一个 内层的 observable 就不会开始 (**排队**)
      * 如果 前一个 内层 observable 是无限流，下一个内层的 observable 就永远不会开始 (饿死)

* switch **新值覆盖旧值**

  ```js
  source.map(e => stream1).switch().subscribe(....)
  ```

  * 新的 内层 Observable 替换旧的内层 Observable(被退订)
  * 适用于 URL 变更 导致的Request 变更 (上一个 request 还没有返回，又刷新了 url 的话，那么是以新的 url 对应的 request 为准)

* mergeAll **并发**

  ```js
  source.map(e => stream1).mergeAll(x).subscribe(...)
  ```

  * 允许多个(x) 内层 Observable 同时存在 射值，如果达到数量 x，那么新到的内层 Observable不会开始



#### map + 高阶变低阶

* concatMap， **继发**

  ```js
  source.concatMap(e => stream1, 
                   (outside, inside, outsideIndex, insideIndex) => inside)
      .subscribe(...);
  ```

  * 内层流排队效果
  * 高阶转低阶
  * 第二个参数 result selector 函数，参数分别为 外层 observbale, 内层 observable, 外层 observable index, 内层 observable index
  * memory issue:  
    * 如果外层 observable 过频繁射值，会导致多个内层 observable 排队
    * **内层 observable 无法退订，除非外层 observable 被退订**

* mergeMap / flatMap(alias)， **并发，同时处理**

  * 想要使用 flatMap 也要 `import {mergeMap} from 'rxjs/operators/mergeMap'`
  * memory issue: **内层 observable 无法退订，除非外层 observable 被退订**

* switchMap,  **并发，新值替代旧值**

  * 无 memory issue: 当新的 observable 到来的时候，旧的内层 observable 自动被退订
  * 使用场景
    * autocomplete



#### 过滤操作

* filter - `source.filter(i => i > 1).subscribe(...)`



#### 截断操作 - 截断 不会 complete 的流

* take(x) 

  * 选取最开始的 x 个值，并 complete
  * `Rx.Observable.interval(1000).take(2)` 
* takeUntil(stream)

  * 当 stream 发出值的时候，截断 source
  * `Rx.Observable.fromEvent(..).takeUntil(stream).subscribe(....)`
* takeLast(x)

  * 取 source 最后 x个 值，**必须等到 source complete**
  * last() = takeLast(1)
* skip(x)
  * 跳过前面 x 个 值



#### 稀释，反弹跳  debounce

* debouceTime

  ```js
  FormControl.valueChanges.debounceTime(500).subscribe(....)
  ```

  * **最小静默期！**
  * 计时器规定时间内，新值到来，更新值+重启计时器
  * 计时器时间到，发送 latest value

* throttleTime

  * **控制最高频率，先手优势**
  * 收到 value1, 启动计时器
    * 计时器时间内，拒接之后到来所有 的值
    * 计时器时间到，发送 value1



#### 筛选

* distinct(callback) - **Set**

  ```js
  source.distinct(x => x.id)....
  ```

  * 接收 筛选函数
  * 内部会用Set 记录之前的值
  * `distinct(cb, flush)` ，为了防止内部 Set 过大，当 flush 发出值的时候，清空内部的 Set

* distinctUntilChanged()

  * 只对 current value 和 last value 做比较过滤
  * **过滤连续输出的相同值**



####延迟

* delay 延迟值到达时间
* delayWhen(stream1) 延迟 source，直到 对应相位的 stream1 射出了值



#### 错误处理

* throw

  * `Rx.Observable.throw(error)` 抛出错误

* catch

  * `source.catch((errObservable, sourceObservable) => {...})`

  * 遇到错误，返回一个新的 Observable

  * 适用场景：间隔请求 - 当返回 source observable 的时候

    ```js
    http.get(url).catch((err, source) => {
        console.log('retry');
        return Rx.Observable.empty().delay(1000).concat(source);
      }).subscribe(data => {
        console.log(data);
      });
    ```

* retry

  ```js
    Rx.Observable.of('a','b','c',1)
      .zip(Rx.Observable.interval(1000), (x, y) => x)
      .map(x => x.toUpperCase())
      .retry(2)
      .subscribe(data => console.log(data), err => console.log('err'));
  ```

  * 遇到 err, retry挡住该 error，并会返回 source Observable, 重新尝试该链
  * retry(x): 重新尝试 x 次

* retryWhen






