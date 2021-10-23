const ftp = require('ftp');
var fs = require('fs');
const path = require('path');



var client = new ftp();

const ftpConnection = async () => {
   await client.connect({
      host: 'ftp.altoforesta.cl',
      user: 'Fabianest@colorweb.cl',
      password: 'Fabi1234'
   })
   console.log('FTP Online');
}

const ftpUpload =  async () => {
  await client.on('ready', function() {
     let ruta = path.dirname(require.main.filename);
     ruta = ruta  + '/ftp/prueba.txt';
     client.put(ruta, 'prueba-remote-copy.txt', function(err) {
        if(err) console.log(err);
     });
  });

}

const ftpNewFile =  async () => {
   await client.on('ready', function() {
      let ruta = path.dirname(require.main.filename);
      ruta = ruta  + '/ftp/prueba.txt';
      client.put(ruta, 'prueba-remote-copy.txt', function(err) {
         if(err) console.log(err);
      });
   });
 
 }


const ftpDownload = async () => {
   await client.on('ready', function() {
      let ruta = path.dirname(require.main.filename);
      ruta = ruta + '/ftp/local/test.txt'
      client.get('ejemplo.txt', function(err, stream){
         if (err) console.log(err);
         stream.once('close', function() { client.end(); });
         stream.pipe(fs.createWriteStream(ruta));
      });
 });
}


module.exports = {
   ftpConnection,
   ftpUpload,
   ftpDownload
}
