const {response, request} = require('express');

const Folder = require('../models/Schemas/folder');

const folderGet = (req, res = response) => {
    res.json({
        msg: ' ESTAS HACIENDO UN GET '
    })
}

const folderPost = (req, res)=>{

} 

const folderDelete = (req, res) =>{

}

const folderPut = (req, res) =>{

}

const folderPatch = (req, res) =>{

}

module.exports = {
    folderGet,
    folderPost,
    folderPut,
    folderDelete,
    folderPatch
}