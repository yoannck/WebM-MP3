/**
 * WebM-MP3
 * Module to convert WebM blob to MP3 blob
 * Author : Yoann Chane Kive
 */
var W3Module = (function() {
  if (window.Worker) {
    const MAX_CHUNK = 30000000;
    let STEPS = 0;
    var audioCtx = new AudioContext();
    let datas = [];
    let limit = 1;
    let offset = 0;
    let time = 0;
    let fileSize = 0;
    let bufferHeader = null;
    let worker = new Worker("js/process.js");
    let options = {};

    const _appendBuffer = function(buffer1, buffer2) {
      var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
      tmp.set(new Uint8Array(buffer1), 0);
      tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
      return tmp.buffer;
    };

    const getWebmBlob = function(url) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        var date1 = new Date();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = () => {
          var date2 = new Date();
          console.log('DOWNLOAD SUCCEEDED : ' + (date2 - date1) + 'ms');
          time += (date2 - date1);
          resolve(xhr.response);
        };
        xhr.send();
      });
    };

    const convertWebmToMP3 = function(webmBlob, decomposition = false) {
      worker.postMessage({ init : true });
      STEPS = 0;
      datas = [];
      offset = 0;
      time = 0;
      return new Promise(function (resolve, reject) {

        worker.onmessage = (event) => {
          console.log(`Piece of Buffer ${event.data.index} / ${limit + 1} - Finish : ${event.data.duration} ms `);
          time += event.data.duration;

          datas.push(event.data.blob);
          if (event.data.index >= limit + 1) { // Blob MP3 Finalize
            const newBlob = new Blob(datas, { 'type': 'audio/mpeg' })
            if (decomposition) {
              resolve(datas);
            } else {
              resolve(newBlob);
            }
            console.log(`MP3 Ready : ${time} ms`);
          }
        };

        let blob = new Blob([webmBlob], { 'type' : 'audio/ogg; codecs=opus' });
        options = { 'header': null, 'clusters': [] };
        fileSize = blob.size;
        let countBlock = 0;
        let self = this; // we need a reference to the current object

        // Prepare bytes header + clusters
        const readEventEBML = function(evt) {
          let binary = event.target.result;
          var date1 = new Date();
          EBML = parseEBML(binary, options);
          var date2 = new Date();
          time += (date2 - date1);

          limit = Math.floor(fileSize / MAX_CHUNK);
          console.log('TOTAL CLUSTER : ' + options.clusters.length + ' duration : ' + (date2- date1) + 'ms' + ' --- limit :' + limit);

          if (options.header !== null) {
            chunkReaderBlock(0, options.header, blob); // start read with the initialization segment
          } else {
            console.log(`Error - EBML.`);
          }
        };
        let r = new FileReader();
        r.onload = readEventEBML;
        r.readAsBinaryString(blob);

        const readEventHandler = function(buffer, end, nextCluster) {
          if (offset === 0) { // Extract the initialization segment header.
            bufferHeader = buffer;
            offset = end;
            chunkReaderBlock(offset, nextCluster, blob); // read next cluster
          } else {
            let chunkBuffer = _appendBuffer(bufferHeader, buffer);

            audioCtx.decodeAudioData(chunkBuffer, (buffer) => {
              STEPS = (parseInt(STEPS) + 1);
              // console.log('DECODED IN PROGRESS : ' + STEPS);
              worker.postMessage({
                step: STEPS,
                buffer1 : buffer.getChannelData(0),
                buffer2 : buffer.getChannelData(1)
              });

              offset = end;
              if (offset !== nextCluster) {
                chunkReaderBlock(offset, nextCluster, blob);
              }
              else {
                console.log("Done reading file");
                return;
              }
            });
          }
        }

        const chunkReaderBlock = function(_offset, _end, _file) {
          countBlock++;
          let r = new FileReader();
          // console.log(`${_offset} + ${length} =  ${_offset + length} / ${fileSize} `);
          console.log(`${_offset} -> ${_end} / ${fileSize} `);
          let blob = _file.slice(_offset, _end);
          r.onload = (evt) => {
            if (evt.target.error == null) {
              //Selection Next Cluster Chunk
              const max = countBlock * MAX_CHUNK;
              let nextCluster = fileSize;
              if (countBlock <= limit) {
                let c = options.clusters.find( x => (x >= max) );
                nextCluster = (c) ? c : fileSize;
              }
              // console.log('COUNT BLOCK : ' + countBlock + ' -- nextCluster -- ' + nextCluster);
              readEventHandler(evt.target.result, _end, nextCluster); // define next cluster;
            } else {
              console.log("Read error: " + evt.target.error);
              return;
            }
          };
          r.readAsArrayBuffer(blob);
        }
      });
    };
    return {
      getWebmBlob: getWebmBlob,
      convertWebmToMP3: convertWebmToMP3
    };
  } else { console.log("Worker not support !") }
})();
