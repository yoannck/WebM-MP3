console.log('Worker Enabled.');
Mp3LameEncoderConfig = {
  TOTAL_MEMORY: 1073741824,
};
importScripts('Mp3LameEncoder.min.js');
let index = 0;

onmessage = (event) => {
  Promise.resolve(event.data).then( convert() );
};

// Buffer needs two channels
function convert() {
  index++;
  return buffer => {
    // console.log(buffer);
    var date1 = new Date();
    const sampleRate = 44100;
    const bitRate = 128;
    let encoder = new Mp3LameEncoder(sampleRate, bitRate);
    encoder.encode([buffer.buffer1, buffer.buffer2]);
    const mp3blob = encoder.finish();
    var date2 = new Date();
    postMessage({ index: index, blob: mp3blob, duration: (date2 - date1) });
  };
}
