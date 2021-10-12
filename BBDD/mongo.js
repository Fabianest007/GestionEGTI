const mongoose= require('mongoose');

mongoose.connect('mongodb://localhost:27017/GestionTest', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Conexion con BBDD exitosa'))
    .catch(err => console.log('Error al conectar a la BDD: ',err))

const userSchema = new mongoose.Schema({
    name            :String,
    lastname        :String,
    position        :String,
    email           :String,
    passwd          :String,
    creation_date   :{type:Date, default: Date.now},
    accesslvl       :Number
})

const folderSchema = new mongoose.Schema({
    name            :String,
    author          :String,
    route           :String,
    creation_date   :{type:Date, default: Date.now},
    accesslvl       :Number
})

const fileSchema = new mongoose.Schema({
    name            :String,
    file_type       :String,
    author          :[String],
    route           :String,
    creation_date   :[{type:Date, default: Date.now}],
    accesslvl       :Number,
    description     :[String],
    version         :[String],
    tags            :[String]
})

//############################################# Funciones de Usuario #################################################################//

const User = mongoose.model('Users',userSchema);

async function createUser(name,lastname,position,email,passwd,accesslvl){
    const user = new User({
        name            :name,
        lastname        :lastname,
        position        :position,
        email           :email,
        passwd          :passwd,
        accesslvl       :accesslvl
    })
    const result = await user.save();
    console.log("Se ha creado con exito el siguiente usuario: ",result);
}
//createUser("Fabián","Estefanía","Ayudante","festefaniad@correo.uss.cl","pass1234",8);

async function login(email,passwd){
    const user = await User.findOne({email: email, passwd: passwd});
    //console.log(user);
    if (user == null){
        return false;
    }else{
        return true;
    }
    
}
//loginBBDD("festefaniad@correo.uss.cl","pass1234");


async function deleteUser(id){
    //const result = await User.deleteOne({ _id:id });  //Una forma de eliminar varios datos a la vez
    const result = await User.findByIdAndDelete(id);
    console.log("Se ha eliminado al siguiente usuario: ",result._id);
}

//############################################# Funciones de Carpetas #################################################################//



//############################################# Funciones de Archivos #################################################################//



//############################################# Exportacion del Modulo #################################################################//

module.exports = {
    createUser,
    deleteUser,
    login
}