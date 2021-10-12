const { Schema, model} = require('mongoose');

const fileSchema = Schema({
    name: {
        type: String,
        require: true
    },

    file_type: {
        type: String,
        require: true
    },

    author: {
        type: [String],
        require: true
    },

    route: {
        type: String,
        require: true
    },

    creation_date: {
        type: [Date],
        default: Date.now
    },

    accesslvl: {
        type: Number,
        require: true
    },

    description: {
        type: [String],
        require: false
    },

    version: {
        type: [String],
    },

    tags: {
        type: [String],
        require: [true, 'Debe contener al menos una etiqueta']
    }
});

module.exports = model('Files', fileSchema);
