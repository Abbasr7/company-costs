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

todoSchema.statics.saveJobTitle = function(token, data) {

    var task = new this(data);
    task.save()

    console.log(task);
    if (!task) {
        return `Error  ${task}`;
    }
    return task;

}

let JobTitle = mongoose.model('JobTitle', todoSchema);

module.exports = {
    JobTitle
}