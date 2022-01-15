const { mongoose } = require('../db/database');
const { ObjectId } = require('bson');
const schema = mongoose.Schema;

let todoSchema = new schema({
    userid: {
        type: ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 3
    },
    status: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        // required: true
    }
});

todoSchema.statics.saveLevel = function(_id, data) {

    var task = new this(data);
    task.save()

    console.log(task);
    if (!task) {
        return `Error ${task}`;
    }
    return task;

}

let Levels = mongoose.model('Levels', todoSchema);

module.exports = {
    Levels
}