const { urlencoded } = require('express');
const { isAuthenticated } = require('../helpers/auth');
const express = require('express');
const Carpeta = require('../models/schemas/folder');
const Archivo = require('../models/schemas/file');
const fileSystem = require('fs');
const { get } = require('mongoose');
const router = express.Router();


router.get('/home', isAuthenticated, async(req, res) =>{
    ruta = '/home';
    const {name , lastname, position, email , accesslvl, is_admin} = req.user;
    //const folders = await Carpeta.find({route: '/home'}).lean();
    const folders = await Carpeta.find({route: '/home', accesslvl:{$gte:accesslvl}}).sort({name:'asc'}).lean();
    let no_content = false
    if (folders != undefined){
        no_content = false;
    } else {
        no_content = true;
    }
    res.render('folders/home',{folders, ruta, name, lastname, position, email, accesslvl, is_admin, no_content} );
});

router.get('/home/:id', isAuthenticated, async(req, res) => {
    const {name , lastname, position, email , accesslvl} = req.user;
    const folder = await Carpeta.findById(req.params.id);
    const foldername = folder.route + '/' + folder.name;
    const folderid = req.params.id
    const prev_folder = folder.prev_folder;
    const ruta = folder.route + '/' + folder.name;
    const folders = await Carpeta.find({route: ruta, accesslvl:{$gte:accesslvl}}).sort({name:'asc'}).lean();
    const files = await Archivo.find({route: ruta, accesslvl:{$gte:accesslvl}}).sort({name:'asc'}).lean();
    let no_content = false
    if (files.length != 0 || folders.length != 0){
        no_content = false;
    } else {
        no_content = true;
    }
    res.render('folders/home', { folders, files, ruta, name, lastname, position, email, accesslvl, foldername, folderid, prev_folder, no_content });
});

router.get('/new', isAuthenticated, (req, res) =>{
    ruta = req.query.ruta;
    prev_folder= req.query.prevfolder
    console.log(prev_folder);
    const {name , lastname, accesslvl} = req.user;
    const levels = listAccessLevel(accesslvl);
    res.render('folders/new-folder', {ruta, name, lastname, levels,prev_folder});
});

router.post('/new-folder', isAuthenticated, async(req, res)=>{
    const {name, author, route, accesslvl, prev_folder} = req.body; //Recordar hacer las validaciones de estos campos
    const repoDir = 'Repository'+ route + '/' + name;
    console.log(repoDir);
    if (fileSystem.existsSync(repoDir)){
        console.log('Error: la carpeta ' + repoDir + ' ya existe');
        res.redirect('/api/folder/home/' + prev_folder);
    } else {
        fileSystem.mkdir(repoDir, async(error) =>{
            if (error){
                console.log(error.message);
                res.redirect('/api/folder/home/' + prev_folder);
            } else {
                console.log("Directorio creado en: "+ repoDir);
                await createFolder(name, author, route, accesslvl, prev_folder);
                res.redirect('/api/folder/home/' + prev_folder);
            }
        })
    }
});

router.get('/home/folder/:id', isAuthenticated, async(req, res) => {
    const {name , lastname, position, email , accesslvl} = req.user;
    const folder = await Carpeta.findById(req.params.id);
    const {author, route, creation_date, prev_folder} = folder;
    const folder_name = folder.name;
    const folder_accesslvl = folder.accesslvl;
    res.render('folders/folder', {folder_name, author, route, creation_date, folder_accesslvl, prev_folder, name , lastname, position, email , accesslvl} );
});


router.post('/home/search', isAuthenticated, async(req, res)=>{
    const {name , lastname, position, email , accesslvl} = req.user;
    let {info} = req.body;
    info = "/"+ info + "/";
    const folders = await Carpeta.find(
        { $text: { $search: info } },
        { score: { $meta: "textScore"} },
        { accesslvl:{$gte:accesslvl} }
        ).sort({score: { $meta: "textScore" } } ).lean();

    const files = await Archivo.find(
        { $text: { $search: info } },
        { score: { $meta: "textScore"} },
        { accesslvl:{$gte:accesslvl} }
        ).sort({score: { $meta: "textScore" } } ).lean();

        let no_content = false
        if (files.length != 0 || folders.length != 0){
            no_content = false;
        } else {
            no_content = true;
        }
        res.render('folders/home', { folders, files, ruta, name, lastname, position, email, accesslvl, no_content });
    
});

// router.post('/new-folder/:route', async(req, res)=>{
//     const prevRoute = req.params.route;
//     const {name, author, route, accesslvl} = req.body; //Recordar hacer las validaciones de estos campos
//     await createFolder(name, author, route, accesslvl);
//     res.redirect('api/folder/'+ prevRoute); //Recordar devolverlo a la carpeta de la que provenia
// });

async function createFolder(name,author,route,accesslvl, prev_folder){
    const newFolder = new Carpeta({ name, author, route, accesslvl, prev_folder });
    //newFolder.route = '/home/Acreditacion';
    const result = await newFolder.save();
};

function listAccessLevel(accesslvl){
    let levels={};
    if (accesslvl == 1){ levels= [ {number: '1', text: 'Nivel 1'}, {number: '2', text: 'Nivel 2'}, {number: '3', text: 'Nivel 3'}, {number: '4', text: 'Nivel 4'}, {number: '5', text: 'Nivel 5'} ] ; }
    if (accesslvl == 2){ levels= [ {number: '2', text: 'Nivel 2'}, {number: '3', text: 'Nivel 3'}, {number: '4', text: 'Nivel 4'}, {number: '5', text: 'Nivel 5'} ] ; }
    if (accesslvl == 3){ levels= [ {number: '3', text: 'Nivel 3'}, {number: '4', text: 'Nivel 4'}, {number: '5', text: 'Nivel 5'} ] ; }
    if (accesslvl == 4){ levels= [ {number: '4', text: 'Nivel 4'}, {number: '5', text: 'Nivel 5'} ] ; }
    if (accesslvl == 5){ levels= [ {number: '5', text: 'Nivel 5'} ] ; }
    return levels;
};


function renameFolder(oldname, route, newname,){
    let ruta = path.dirname(require.main.filename);
    ruta = ruta + '/Repository' + route;
    const prevRoute = ruta + '/' + oldname;
    const newRoute = ruta + '/'+ newname;
    fileSystem.rename(prevRoute,newRoute, function( err ){
        if ( err ) console.log('ERROR: ' + err);
    });
};

module.exports = router;