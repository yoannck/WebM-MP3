# WebM > MP3

Module to convert WebM blob to MP3 blob

## Methods

The module uses https://github.com/higuma/mp3-lame-encoder-js

```javascript

W3Module.getWebmBlob('URL WEBM').then( (webmBlob) => { /* YOUR CODE */ } );
// OR GET webmBlob on your way : from XMLHttpRequest / stream / etc ...

...

W3Module.convertWebmToMP3(webmBlob).then( (mp3Blob) => { /* YOUR CODE */ } );


```

## Install

```javascript
<script src="W3Module.js"></script>
<script src="schema-ebml.js"></script>
<script src="lib-ebml.js"></script>
```
