const helpers = {};

helpers.isAuthenticated = (req, res, next) =>{
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('error_msg', 'Debe iniciar sesion');
        res.redirect('/api/user/login');
    }
}

module.exports = helpers;