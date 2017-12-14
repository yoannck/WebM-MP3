# WebM > MP3

Module to convert WebM blob to MP3 blob

## Methods

The module uses https://github.com/higuma/mp3-lame-encoder-js

```javascript
var module = require("webm-mp3");

// webmBlob : from XMLHttpRequest / stream / etc ...

module.convertWebmToMP3(webmBlob);
var mp3Blob = module.getMP3Blob();
```

## Install

Run `npm install --save webm-mp3`
