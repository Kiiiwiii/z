// import Rx first !

const ob = new Rx.Subject();
const srcArr = ['https://source.unsplash.com/weekly?water', 'https://source.unsplash.com/weekly?mountain', 'https://source.unsplash.com/weekly?moon'];
ob.asObservable().subscribe(src => {
  const imgEl = document.createElement('img');
  imgEl.onload = () => {
    if (srcArr.length > 0) {
      ob.next(srcArr.shift());
    }
  }
  imgEl.src = src;
  document.body.appendChild(imgEl);
});
ob.next(srcArr.shift());