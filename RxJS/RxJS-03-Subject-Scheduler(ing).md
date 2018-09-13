## 1. Subject



#### 1.1 Subject - 广播

* Subject  vs. Observable

  * Subject 是 hot observable, 有新订阅者加入的时候，新订阅者从 当前位置继续收听
  * Observable 是 cold observable，新订阅加入，从头开始收听

* 以 Observable 进行 广播的方法

  ```js
  const mySubject = new Rx.Subject();
  const stream  = Rx.Observable.interval(1000).take(5);
  
  // 广播先订阅 stream, 广播开始！
  stream.subscribe(mySubject);
  
  // 订阅者3s 后开始订阅广播，错过前面的消息
  setTimeout(() => {
      mySubject.subscribe(data => console.log(data));
  }, 3000);
  ```

* **广播的  next 发消息方法**

  * 适用于自己构建一个 订阅-发布模型 （父组件 唯一instance发布内容，所有子组件订阅）

    ```js
    // module.js
    import 'parent.js';
    import 'child.js';
    ```

    ```js
    // parent.js
    const subject = new Subject();
    
    // 同步
    subject.next(1);
    // 异步
    setTimeout(() => {
    	subject.next(2);
    }, 1000);
    
    // 将 subject 隐藏，只暴露 observable
    export default subject.asObservable();
    ```

    ```js
    import myObservable from 'parent.js';
    myObservable.subscribe(....)
    ```

    > 遵循 js es6 module 准则

  * 另外一种构建 custom 订阅-发布模型的方法是用 `Observable.create(..)`



#### 1.2 多类型的 subject

* BehaviorSubject

  ```js
  const subject = new BehaviorSubject(0);
  ```

  * 必须传入初始值

  * 当有新的 订阅者订阅的时候，立即返回 latest value 给订阅者 (记录状态)

  * 针对 BehaviorSubject 必须传初始值，可以采取 skip 的方式避免

    * 风险 - BehaviorSubject + skip 可能清空 BehaviorSubject 缓存 latest value 的效果

      ```js
      const mySubject = new BehaviorSubject(null);
      const myObservable = mySubject.asObservable().skip(1);
      myObservable.subscribe(d => console.log('1:' + d));
      
      mySubject.next('a');
      myObservable.subscribe(d => console.log('2:' + d));
      ```

      只会输出 1: a

* ReplaySubject

  ```js
  const subject = new ReplaySubject(x);
  ```

  * cache x个 latest value
  * **ReplaySubject(1) 相当于没有初始值的 BehaviorSubject 效果**

* AsyncSubject



#### 1.3 Operators in Subject

* multicast 广播效果 - 手动connect

  ```js
  const stream = source.multicast(new Subject());
  
  const subscription1 = stream.subscribe(p1);
  
  // 广播正式开始
  const boardcast = stream.connect();
  
  // p2 错过一部分广播
  setTimeout(() => {
      stream.subscribe(p2);
  }, 2000);
  
  // p1 退订广播,广播继续
  subscription1.unsubscribe();
  
  // 广播结束
  boardcast.unsubscribe();
  ```

* multicast + refCount - 自动connect

  ```js
  const stream = source.multicast(new Subject()).refCount();
  ```

  * 一旦有了订阅者，广播就开始
  * 一旦没有订阅者，广播自动结束

* publish - 简写形式

  * `.multicast(new Subject())` === `.publish()`
  * `.multicast(new Subject()).refCount()` === `.publish().refCount()` \=\== `share()`
  * `.multicast(new ReplaySubject(1))` === `.publishReplay(1)`





## 2. Scheduler

未完成

