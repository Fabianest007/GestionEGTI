const { Schema, model} = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = Schema({
    name: {
        type: String,
        require: [true, 'Todos los datos son obligatorios']
    },

    lastname: {
        type: String,
        require: [true, 'Todos los datos son obligatorios']
    },

    position: {
        type: String,
        require: [true, 'Todos los datos son obligatorios ']
    },

    email: {
        type: String,
        require: [true, 'Todos los datos son obligatorios'],
        unique: true
    },

    passwd: {
        type: String,
        require: [true, 'Todos los datos son obligatorios']
    },

    creation_date: {
        type: String,
        default: Date.now
    },

    accesslvl: {
        type: Number,
        require: [true, 'Todos los datos son obligatorios']
    },
});

userSchema.methods.encryptPassword = async(passwd) =>{
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(passwd,salt);
    return hash;
};

userSchema.methods.matchPassword = async function(passwd){
    return await bcrypt.compare(passwd, this.passwd);
};

module.exports = model('Users', userSchema);