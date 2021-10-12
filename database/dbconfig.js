const mongoose = require('mongoose');

const dbConnection = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });

        console.log('BBDD online');
    }catch{
        console.log(error);
        throw new Error('ERROR A LA HORA DE INICIAR LA BASE DE DATOS');
    }
}

module.exports = {
    dbConnection
}