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
    },
    jobTitle: {
        type: String,
        required: true,
        minlength: 3
    },
    level: {
        type: String,
        required: true,
        minlength: 3
    },
    count: {
        type: Number,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    minsalary: {
        type: Number,
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

let Estimate = mongoose.model('Estimate', todoSchema);

module.exports = {
    Estimate
}