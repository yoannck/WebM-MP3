# WebM > MP3

Module to convert WebM blob to MP3 blob

## Methods

The module uses https://github.com/higuma/mp3-lame-encoder-js

```javascript

var webmBlob = convertModule.getWebmBlob('URL WEBM');
// OR webmBlob : from XMLHttpRequest / stream / etc ...

convertModule.convertWebmToMP3(webmBlob);

var mp3Blob = convertModule.getMP3Blob();

```

## Install

```javascript
<script src="module.js"></script>
```
