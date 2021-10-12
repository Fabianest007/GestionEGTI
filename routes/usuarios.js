const { urlencoded } = require('express');
const express = require('express');
const Usuario = require('../models/schemas/user')
const router = express.Router();
const path = require('path');
const passport = require('passport');

router.get('/', (req, res) =>{
    // res.sendFile(path.resolve(__dirname,'../public/P_InicioSesion/index.html'));
    res.render('index');
});


router.get('/login', async(req, res)=>{
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/api/folder/home',
    failureRedirect: '/api/user/login',
    failureFlash: true
}))

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
})

router.get('/new', (req, res) =>{
    res.render('users/new-user');
});

router.post('/new-user', async (req, res) =>{
    const {name, lastname, position, email, passwd, confPasswd, accesslvl} = req.body;
    const errors = [];                                                              //Validaciones manuales
    if(!name) errors.push({text: 'Por favor ingrese un nombre'});
    if(!lastname) errors.push({text: 'Por favor ingrese un apellido'});
    if(!position) errors.push({text: 'Por favor ingrese una posicion'});
    if(!email) errors.push({text: 'Por favor ingrese un email'});
    if(!passwd) errors.push({text: 'Por favor ingrese una contraseña'});
    if(!confPasswd) errors.push({text: 'Por favor confirme la contraseña'});
    if(!accesslvl) errors.push({text: 'Por favor seleccione un nivel de acceso'});
    if(passwd != confPasswd) errors.push({text: 'Las contraseñas no coinciden'});
    //if(passwd.length <= 4) errors.push({text: 'La contraseña debe tener más de 4 caracteres'});
    if(errors.length>0){
        console.log(errors)
        res.render('users/new-user', {errors, name, lastname, position, email, passwd, accesslvl})
    } else {
        const emailUser = await Usuario.findOne({email: email});
        if(emailUser){
            req.flash('error','Este email ya está en uso');
            res.redirect('/api/user/new-user');
        }  else {
            await createUser(name, lastname, position, email, passwd, accesslvl);
            req.flash('success_msg', 'Usuario creado');
            res.redirect('/');
        }
        
    }
});

router.get('/show-users', async(req, res) => {
    const users = await Usuario.find().sort({lastname:'asc'});
    res.render('/notes/show-users', {users});
});

router.get('/edit/:id', async(req, res)=>{
    const user = await Usuario.findById(req.params.id);
    res.render('users/edit-user', {user});
});

router.put('/edit/:id', async(req, res) =>{
    const {name, lastname, position, email, passwd, accesslvl} = req.body;  //Recordar hacer las validaciones de estos campos
    await Usuario.findByIdAndUpdate(req.params.id, {name, lastname, position, email, passwd, accesslvl});
    res.redirect('/api/user/show-users');
});

router.delete('/delete/:id', async(req, res)=>{
    await Usuario.findByIdAndDelete(req.params.id);
    res.redirect('/api/user/show-users');
})

async function createUser(name,lastname,position,email,passwd,accesslvl){
    const newUser = new Usuario({ name, lastname, position, email, passwd, accesslvl })
    newUser.passwd = await newUser.encryptPassword(passwd);
    const result = await newUser.save();
    console.log("Se ha creado con exito el siguiente usuario: ",result);
};

// async function login(body){
//     console.log(body.user + ' ' + body.pass);
//     let user =await Usuario.findOne({email: body.user, passwd: body.pass});
//     console.log(user);
//     if (user == null){
//         return false;
//     }
//     else{
//         return user;
//     }
// };

module.exports = router;