const { urlencoded } = require('express');
const express = require('express');
const router = express.Router();

router.get('/', async(req, res) =>{
   if(req.user){
        res.redirect('/api/folder/home');
    } else {
        res.redirect('/api/user/');
    }

});

router.get('/new', (req, res) =>{
    res.render('users/new-user');
});

router.get('/recuperar', (req, res)=>{
    res.render('users/recuperar');
});

module.exports = router;