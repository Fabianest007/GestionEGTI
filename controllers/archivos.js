const {response, request} = require('express');

const File = require('../models/Schemas/file');

const fileGet = (req, res = response) => {
    res.json({
        msg: ' ESTAS HACIENDO UN GET '
    })
}

const filePost = (req, res)=>{

} 

const fileDelete = (req, res) =>{

}

const filePut = (req, res) =>{

}

const filePatch = (req, res) =>{

}

module.exports = {
    fileGet,
    filePost,
    filePut,
    fileDelete,
    filePatch
}