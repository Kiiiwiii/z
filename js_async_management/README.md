### Different version of how javascript can control the async things

The example I used here is to load image one by one, the next image will only be loaded after the previous image loading is finished.

There currently five ways to control it:

* origin javascript callbacks
* generator + thunk
* rxJS
* promise
* async