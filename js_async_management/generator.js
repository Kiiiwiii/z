function loadImage(src, callback) {
  const imgEl = document.createElement('img');
  imgEl.onload = function () {
    callback();
  }
  imgEl.src = src;
  document.body.appendChild(imgEl);
}

function thunk(originFn) {
  return function (...args) {
    return function (callback) {
      originFn.call(this, args, callback);
    }
  }
}

const loadImageThunk = thunk(loadImage);

function* imageLoadOneByOne(srcs) {
  for (let src of srcs) {
    yield loadImageThunk(src);
  }
}

function run(g, d) {
  // 拿到 generator遍历器
  const it = g(d);

  function next(data) {
    const result = it.next(data);
    // 如果执行完毕，就返回
    if (result.done) {
      return;
    }
    result.value(next);
  }
  next();
}
// 启动
const arr = ['https://source.unsplash.com/weekly?water', 'https://source.unsplash.com/weekly?mountain', 'https://source.unsplash.com/weekly?moon']
run(imageLoadOneByOne, arr);