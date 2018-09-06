async function run(urls) {
  for (let url of urls) {
    try {
      await loadImage(url);
    } catch (e) {
      console.error(e + ' is not successfully loaded');
    }
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const imgEl = document.createElement('img');
    imgEl.onload = function () {
      resolve(url);
    };
    imgEl.onerror = function () {
      reject(url);
    };
    imgEl.src = url;
    document.body.appendChild(imgEl);
  });
}

const arr = ['https://source.unsplash.com/weekly?water', 'https://source.unsplash.com/weekly?mountain', 'https://source.unsplash.com/weekly?moon'];
run(arr);
