const imageUrls = ['https://source.unsplash.com/weekly?water', 'https://source.unsplash.com/weekly?mountain', 'https://source.unsplash.com/weekly?moon']
function imageLoad(url) {
  const imageEl = document.createElement('img');
  imageEl.onload = function () {
    if (imageUrls.length > 0) {
      imageLoad(imageUrls.shift());
    }
  }
  imageEl.src = url;
  document.body.appendChild(imageEl);
}

imageLoad(imageUrls.shift());