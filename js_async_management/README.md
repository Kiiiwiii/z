### Different version of how javascript can control the async things

The example I used here is to load image one by one, the next image will only be loaded after the previous image loading is finished.

There currently four ways to control it:

* origin javascript callbacks
* generator + thunk
* RxJS
* Promise