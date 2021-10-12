const {response, request} = require('express');

const Usuario = require('../models/Schemas/user');

const usuarioGet = (req, res = response) => {
    res.json({
        msg: ' ESTAS HACIENDO UN GET '
    })
}

const usuarioPost = (req, res = response)=>{
    // const { email, passwd } = req.body;
    // const usuario = new Usuario({email, passwd});
    
    // if(usuario === null){
    //     return false;
    // }

    // let result = Usuario(email, passwd)
    //     .then(result=> {
    //         if(result) { res.redirect('../public/P_Principal/inicio');}
    //         else { res.redirect('/');} 
    //     });

} 

const usuarioDelete = (req, res) =>{

}

const usuarioPut = (req, res) =>{

}

const usuarioPatch = (req, res) =>{

}

module.exports = {
    usuarioGet,
    usuarioPost,
    usuarioPut,
    usuarioDelete,
    usuarioPatch
}