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

//Sube un archivo al servidor FTP
const ftpUpload =  async () => {
   let ruta = path.dirname(require.main.filename);
   ruta = ruta  + '/ftp/prueba.txt';
   client.put(ruta, 'prueba-remote-copy.txt', function(err) {
      if(err) console.log(err);
   });
}

//Crea una carpeta en el servidor FTP para el nuevo archivo y lo sube en la ruta recibida
const ftpNewFile =  async (ftpRoute, ftpFile, fileRoute) => {
   client.mkdir(ftpRoute, function(){});  //crea una carpeta en el FTP para almacenar el nuevo archivo
   client.put(fileRoute, ftpFile, function(err) {
      if(err) console.log(err);
   });
}

const ftpNewFolder = async (route) => {
   console.log("Creando carpeta FTP");
   client.mkdir(route, function(err){})
}

//Descarga el archivo desde el servidor FTP
const ftpDownload = async () => {
   let ruta = path.dirname(require.main.filename);
   ruta = ruta + '/ftp/local/test.txt'
   client.get('ejemplo.txt', function(err, stream){
      if (err) console.log(err);
      stream.once('close', function() { client.end(); });
      stream.pipe(fs.createWriteStream(ruta));
   });
}


module.exports = {
   ftpConnection,
   ftpUpload,
   ftpDownload,
   ftpNewFolder,
   ftpNewFile,
}
