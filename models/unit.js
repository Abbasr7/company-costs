const { mongoose } = require('../db/database');
const { ObjectId } = require('bson');
const schema = mongoose.Schema;

let todoSchema = new schema({
    userid: {
        type: ObjectId,
        required: true
    },
    unit: {
        type: String,
        required: true
    }
});

todoSchema.statics.saveUnit = function(token, data) {

    var task = new this(data);
    task.save()

    console.log(task);
    if (!task) {
        return `Error ${task}`;
    }
    return task;

}

let Unit = mongoose.model('Unit', todoSchema);

module.exports = {
    Unit
}