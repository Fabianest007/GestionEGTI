const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const fileupload = require('express-fileupload');
const { dbConnection } = require('../database/dbconfig');
const { ftpConnection } = require('../ftp/ftp');
require('../config/passport');

//duda: port usarlo sin this. cuando se termine la bd
class Server {
    constructor(){
        require('../config/passport');
        this.app = express();
        this.port = process.env.PORT;
        this.userPath = '/api/user';
        this.filePath = '/api/file';
        this.folderPath = '/api/folder';

        //conectar a la base de datos
        this.conectarDB();

        //conectar al servidor FTP
        this.conectarFTP();

        //middlewares
        this.middlewares();

        //Rutas
        this.routes();

        // Settings
        this.app.engine('.hbs', exphbs({
            defaultLayout: 'main',
            layoutsDir : path.join(this.app.get('views'), 'layouts'),
            partialsDir : path.join(this.app.get('views'), 'partials'),
            extname: '.hbs'
        }));
        
    }

    async conectarDB(){
        await dbConnection();
    }

    async conectarFTP(){
        await ftpConnection();
    }
    
    middlewares(){
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.set('view engine', '.hbs');

        this.app.use(express.urlencoded( { extended: true } ));
        this.app.use(methodOverride('_method'));
        this.app.use(session({
            secret: 'UnSecreto',
            resave: true,
            saveUninitialized: true
        }));

        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use(flash());
        this.app.use(fileupload());

        this.app.use((req, res, next)=>{
            this.app.locals.success_msg = req.flash('success_msg');
            this.app.locals.error_msg = req.flash('error_msg');
            //this.app.locals.user = req.user || null;
            next();
        })

        
    }
    
    routes(){
        this.app.use( require('../routes/index'));
        this.app.use( this.userPath, require('../routes/usuarios'));
        this.app.use( this.filePath, require('../routes/archivos'));
        this.app.use( this.folderPath, require('../routes/carpetas'));
        //this.app.use(require('./index.js'));
    }

    listen(){
        this.app.listen( this.port, ()=>{
            console.log(`Server listo en http://localhost:${this.port}`);
        });
    }

}

module.exports = Server;