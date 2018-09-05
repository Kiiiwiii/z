const srcArr = ['https://source.unsplash.com/weekly?water', 'https://source.unsplash.com/weekly?mountain', 'https://source.unsplash.com/weekly?moon'];

function loadImage() {
  let loadingChain = Promise.resolve();
  srcArr.forEach(src => {
    loadingChain = loadingChain.then(_ => {
      return new Promise(resolve => {
        const imgEl = document.createElement('img');
        imgEl.onload = () => {
          if (srcArr.length > 0) {
            resolve(src);
          }
        }
        imgEl.src = src;
        document.body.appendChild(imgEl);
      });
    });
  });
}
loadImage();