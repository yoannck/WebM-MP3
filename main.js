/**
 * WebM-MP3
 * Module to convert WebM blob to MP3 blob
 * Author : Yoann Chane Kive
 */
 if (window.Worker) {
   var CHUNK_SIZE = 20000000;
   var audioCtx = new (window.AudioContext || webkitAudioContext)(); //new AudioContext();
   let datas = [];
   let limit = 1;
   let time = 0;
   let mp3Blob = null;
   let worker = new Worker("scripts/process.js");
   worker.onmessage = (event) => {
     console.log(`Piece of Buffer ${event.data.index} / ${limit} - Finish : ${event.data.duration} ms `);
     time += event.data.duration;
     datas.push(event.data.blob);
     if (event.data.index >= limit) { // Final MP3
       // new Blob([new Uint8Array(arrayBuffer)]);

       const newBlob = new Blob(datas, { 'type': 'audio/mpeg' })
       mp3Blob = window.URL.createObjectURL(newBlob);
       console.log(`OK - MP3 Ready : ${time} ms`);
     }
   };

   module.exports = {
     convertWebmToMP3: function(blob) {
       console.log('Create a clip from blob');
       var blob = new Blob([blob], { 'type' : 'audio/ogg; codecs=opus' });

       var fileReader = new FileReader();
       console.log('ArrayBuffer from blob Webm - In Progress');
       var d1 = new Date();
       fileReader.onload = function(event) {
         var d2 = new Date();
         console.log(`ArrayBuffer Ready: ${(d2 - d1)} ms `);
         let arrayBuffer = event.target.result;
         const totalLength = arrayBuffer.byteLength;
         // console.log(arrayBuffer);

         // Split to many buffer sample -> Decode each (Less Ram / no crash lamemp3) -> Worker

         limit = Math.round(totalLength / CHUNK_SIZE);
         let offset = 0;
         console.log(`ArrayBuffer Ready : ${limit} piece(s)`);
         for (let count = 0; count < limit; count++) {
           let max = ((offset + CHUNK_SIZE) >= totalLength) ? totalLength : offset + CHUNK_SIZE;
           const pie = arrayBuffer.slice(offset, max);
           audioCtx.decodeAudioData(pie, (buffer) => {
             // console.log(buffer);
             worker.postMessage({
               buffer1 : buffer.getChannelData(0),
               buffer2 : buffer.getChannelData(1)
             })
           });
         }

       };
       fileReader.readAsArrayBuffer(blob);
     },
     getMP3Blob: function() {
       return mp3Blob;
     }
   };
 } else { console.log("Worker not support !") }

 // let analyzerModule = (function() {
 //
 // })();
