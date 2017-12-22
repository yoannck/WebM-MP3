console.log('Worker Enabled.');
Mp3LameEncoderConfig = {
  TOTAL_MEMORY: 1073741824,
};
importScripts('Mp3LameEncoder.min.js');
let index = 0;

onmessage = (event) => {
  if (event.data.init) {
    index = 0;
  } else {
    Promise.resolve(event.data).then( convert() );
  }
};

// Buffer needs two channels
function convert() {
  index++;
  return buffer => {
    console.log('IN THE WORKER STEP : ' + buffer.step);
    var date1 = new Date();
    const sampleRate = 44100;
    const bitRate = 128;
    let encoder = new Mp3LameEncoder(sampleRate, bitRate);
    encoder.encode([buffer.buffer1, buffer.buffer2]);
    let mp3blob = encoder.finish();
    var date2 = new Date();
    postMessage({ index: buffer.step, blob: mp3blob, duration: (date2 - date1) });
  };
}
