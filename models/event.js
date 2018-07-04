const mongoose = require('mongoose');
const Schema = mongoose.Schema();

const eventSchema = mongoose.Schema({
    name :{
        type: String,
        require: true,
    },
    college:{
        type: String,
        require: true
    },
    venue:{
        type: String,
        require: true
    },
    description:{
        type: String,
        require: true
    },
    society :{
        type:String,
        require:true
    },
    link:{
        type: String,
        require: true
    }

});

const EventModel = mongoose.model('Event', eventSchema);

module.exports = EventModel;