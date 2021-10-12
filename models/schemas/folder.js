const { Schema, model} = require('mongoose');

const folderSchema = Schema({
    name: {
        type: String,
        require: true
    },

    author: {
        type: String,
        require: true
    },

    route: {
        type: String,
        require: true
    },

    creation_date: {
        type: Date,
        default: Date.now
    },

    accesslvl: {
        type: Number,
        require: true
    },

    prev_folder: {
        type: String,
        require: false
    }
});

module.exports = model('Folders', folderSchema);
