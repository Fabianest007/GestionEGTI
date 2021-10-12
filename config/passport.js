const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/schemas/user');

passport.use( new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd',
}, async (email,passwd,done) => {
    const user = await User.findOne({email: email});
    if(!user){
        return done(null, false, {message: 'Usuario no registrado'});
    } else {
        // console.log(user);
        // console.log(email);
        // const pass2 = await user.encryptPassword(passwd);
        // console.log(pass2);
        const match = await user.matchPassword(passwd);
        if(match){
            return done(null, user,)
        } else {
            return done(null,false, {message:'Contraseña incorrecta'});
        }
    }
}));

passport.serializeUser((user, done) => {
    done(null,user.id);
});

passport.deserializeUser((id, done) =>{
    User.findById(id, (err, user) =>{
        done(err, user);
    })
})
