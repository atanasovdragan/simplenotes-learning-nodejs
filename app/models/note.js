var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var noteSchema = new Schema({
    title: String,
    text: String,
    authorId: Schema.Types.ObjectId
});

module.exports = mongoose.model('Note', noteSchema);
