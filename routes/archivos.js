const { urlencoded } = require('express');
const { isAuthenticated } = require('../helpers/auth');
const express = require('express');
const Carpeta = require('../models/schemas/folder');
const Archivo = require('../models/schemas/file');
const router = express.Router();
const path = require('path');
const fileSystem = require('fs');
const file = require('../models/schemas/file');

router.get('/view/:id',isAuthenticated, async (req, res) =>{
    const file = await Archivo.findById(req.params.id).lean();
    const filename = file.name;
    const {route, file_type, version} = file;
    const {name , lastname, position, email , accesslvl} = req.user;
    const versions = listFileVersions(version, filename, file_type, route);
    res.render('files/file', {file, name, lastname, position, email, accesslvl, versions});
});

router.get('/new', isAuthenticated, (req, res) =>{
    ruta = req.query.route;
    const {name, lastname, accesslvl} = req.user;
    const levels = listAccessLevel(accesslvl);
    res.render('files/new', { ruta, name, lastname, accesslvl, levels });
});

router.post('/new-file', isAuthenticated, async (req, res) =>{
    const {name, author, route, accesslvl, description} = req.body //hay que hacer las validaciones
    const version = 1;
    let ruta = path.dirname(require.main.filename);
    let EDFile = req.files.file;
    const splitname = EDFile.name.split(".");
    const extension = splitname[splitname.length-1];
    ruta = ruta + '/Repository' + route + '/'+ name;
    const fileroute = ruta + '/' + name + '-v' + version + '.'+extension;
    if(createFolder(ruta)){
        EDFile.mv(fileroute, async err =>{
            if(err) {
                return res.status(500).send({message: err})
            }
            await createFile(name, author, route, accesslvl, description, extension, version);
            res.redirect('/api/folder/home');
        });
    } else {
        res.redirect('/api/folder/home');
    }
});

router.get('/edit/:id',isAuthenticated, async (req, res) =>{
    const file = await Archivo.findById(req.params.id).lean();
    const {name, lastname, accesslvl} = req.user;
    const levels = listAccessLevel(accesslvl);
    res.render('files/edit', { file, name, lastname, accesslvl, levels });
});

router.post('/edit-file/:id', isAuthenticated, async (req, res)=>{// si se le cambia el nombre al archivo hay que: -cambiar el nombre en la base de datos -renombrar la carpeta del respositorio
    const file = await Archivo.findById(req.params.id).lean();
    const {name, author, route, version, file_type} =file;
    const {newname, newaccesslvl, newdescription} = req.body;   //lo unico que puede cambiar es el nombre, nivel de acceso y la descripcion
    if(!(name == newname)){ renameFilesAndFolders( name, newname ,route, version, file_type ); }
    await Archivo.findByIdAndUpdate(req.params.id, {
        name                  :newname,
        author                :author,
        file_type             :file_type,
        route                 :route,
        accesslvl             :newaccesslvl,
        description           :newdescription,
        version               :version
    });
    res.redirect('/api/folder/home');
});

router.get('/download/:id', isAuthenticated, async (req, res) => {
    const archivo = await Archivo.findById(req.params.id);
    const {version} = archivo;
    let ruta = path.dirname(require.main.filename);
    ruta = ruta + '/Repository' + archivo.route + '/' + archivo.name;
    const filename = archivo.name+'-v'+ version +'.'+archivo.file_type;
    ruta = ruta + '/'+filename;

    if (fileSystem.existsSync(ruta)){      //Si existe el archivo, sirvelo
        res.download(ruta,filename, err => {
            if(err){
                console.log(err);
                res.redirect('/api/folder/home');
            } else{console.log("Archivo "+ req.params.id +" descargado por el cliente");}
        });
    } else {                              //Sino, avisar que el archivo no existe en el servidor
        console.log("El archivo " + req.params.id +" no puede ser descargado");
        res.redirect('/api/file/view/'+req.params.id);
    }
});

router.get('/version', isAuthenticated, async (req, res) => {
    let info = req.query.info;
    console.log(info);
    info = info.split('|');
    let ruta = path.dirname(require.main.filename);
    ruta = ruta + '/Repository' + info[0]+ '/'+info[1];
    filename = info[1];
    if (fileSystem.existsSync(ruta)){
        res.download(ruta,filename, async err => {
            if(err){
                console.log(err);
            } else{
                console.log("Archivo descargado");
            }
        });
    } else {                         
        console.log("El archivo " + filename +" no puede ser descargado");
        res.redirect('/api/folder/home/');
    }

});

router.get('/update/:id', isAuthenticated, async (req, res) =>{
    const file = await Archivo.findById(req.params.id).lean();
    file.version = parseInt(file.version) +1;
    const {name, lastname, accesslvl} = req.user;
    const levels = listAccessLevel(accesslvl);
    res.render('files/update', { file, name, lastname, accesslvl, levels });
})

router.post('/update-file/:id', isAuthenticated, async (req, res)=>{
    const file = await Archivo.findById(req.params.id).lean();
    file.version = parseInt(file.version) +1;
    const {newauthor, newdescription} = req.body;
    const {name, route} = file;
    let newversion = file.version;
    await Archivo.findByIdAndUpdate(req.params.id, {
        author                :newauthor,
        description           :newdescription,
        version               :newversion
    });
    let ruta = path.dirname(require.main.filename);
    let EDFile = req.files.file
    const splitname = EDFile.name.split(".");
    const extension = splitname[splitname.length-1];
    ruta = ruta + '/Repository' + route + '/'+ name;
    const fileroute = ruta + '/' + name + '-v' + newversion + '.'+extension;
    EDFile.mv(fileroute, err =>{
        if(err) {
            return res.status(500).send({message: err})
        }
        res.redirect('/api/folder/home');
    });
});
module.exports = router;

async function createFile(name, author, route, accesslvl, description, extension, version){
    const type = name.split(".");
    const file_type= extension;
    const newFile = new Archivo({
        name                  :name,
        author                :author, 
        file_type             :file_type,
        route                 :route,
        accesslvl             :accesslvl,
        description           :description,
        version               :version
    });
    const result = await newFile.save();
}

function createFolder(ruta){
    if (fileSystem.existsSync(ruta)){
        console.log('La carpeta ya existe');
        return false;
    } else {
        fileSystem.mkdir(ruta, async(error) =>{
            if (error){
                console.log(error.message);
            } else {
                console.log("Directorio creado en: "+ ruta);
            }
        });
        return true;
    }
};

function listAccessLevel(accesslvl){
    let levels={};
    if (accesslvl == 1){ levels= [ {number: '1', text: 'Nivel 1'}, {number: '2', text: 'Nivel 2'}, {number: '3', text: 'Nivel 3'}, {number: '4', text: 'Nivel 4'}, {number: '5', text: 'Nivel 5'} ] ; }
    if (accesslvl == 2){ levels= [ {number: '2', text: 'Nivel 2'}, {number: '3', text: 'Nivel 3'}, {number: '4', text: 'Nivel 4'}, {number: '5', text: 'Nivel 5'} ]; }
    if (accesslvl == 3){ levels= [ {number: '3', text: 'Nivel 3'}, {number: '4', text: 'Nivel 4'}, {number: '5', text: 'Nivel 5'} ]; }
    if (accesslvl == 4){ levels= [ {number: '4', text: 'Nivel 4'}, {number: '5', text: 'Nivel 5'} ]; }
    if (accesslvl == 5){ levels= [ {number: '5', text: 'Nivel 5'} ]; }
    return levels;
};

function listFileVersions(version,name,file_type,route){
    let files = [];
    let nombre;
    route = route + '/' + name;
    for(let i=1 ; i<version ; i++){
        nombre = name + '-v' + i + '.' + file_type;
        files.push( { version: i, name: nombre, route: route } );
    }
    return files;
};

function renameFilesAndFolders( oldname, newname ,route, version, file_type ) {
    let ruta = path.dirname(require.main.filename);
    ruta = ruta + '/Repository' + route;
    let prevRoute = ruta + '/' + oldname;
    let newRoute = ruta + '/'+ newname;

    if (fileSystem.existsSync(prevRoute)){
        fileSystem.renameSync( prevRoute, newRoute );
    } else {
        console.log("Error: No se puede editar, la ruta " + prevRoute + ", no existe en el respositorio en el servidor");
        return;   
    }
    
    //modificando el nombre de los archivos dentro de la carpeta
    for(let i=1; i<= version; i++){
        prevRoute = ruta + '/' + newname + '/' + oldname + '-v' + i + '.' + file_type; 
        newRoute = ruta + '/' + newname + '/' + newname + '-v' + i + '.' + file_type; 
        if (fileSystem.existsSync(prevRoute)){
            fileSystem.renameSync( prevRoute, newRoute);
        } else {
            console.log("Error: No se puede editar, el archivo " + prevRoute + ", no existe en el respositorio en el servidor");
        }
    }
};
