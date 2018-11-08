```js
function curry(fn){
  const length = fn.length;
  let count = 0;
  let allArgs = [];
  function wrapping(...args) {
    count += args.length;
    allArgs.push(...args);
    if (count < length) {
      return wrapping;
    } else {
      // when it is time to call the original function, it should reset variable of closure
      const result =  fn.apply(this, allArgs);
      count = 0;
      allArgs = [];
      return result;
    }
  }
  return wrapping;
}

const fn = curry((x,y,z) => {
  console.log(x, y, z);
});

fn('x', 'y', 'z');
fn('x', 'y')('z');
fn('x')('y', 'z');
fn('x')('y')('z');
```