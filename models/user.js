const { mongoose } = require('../db/database');
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const SECRET_KEY   = 'besm';

const schema = mongoose.Schema;
const stringReset = {
    type: String,
    trim: true,
}
const userSchema = new schema({
    username: {
        type: String,
        require: true,
        trim: true,
        unique: true,
        minlength: 3
    },
    password: {
        type: String,
        require: true,
        trim: true,
        minlength: 6
    },
    email: {
        type : String,
        require : true,
        minlength : 6,
        unique : true,
        trim : true,
    },
    location: {
        type : String,
        require : true,
        minlength : 3,
    },
    tokens: [{
        _id: false,
        role: stringReset,
        token: stringReset
    }]
});
userSchema.methods.toJson = function () {
    let user = this;
    let userObject = user.toObject();

    return _.pick(userObject, ['_id', 'username', 'email']);
}
userSchema.statics.findByUsername = function (username, password) {
    let User = this;
    return User.findOne({
        username
    }).then((user) => {
        if (!user) {
            return Promise.reject('username or password is wrong!');
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject('Username or Password is wrong!');
                }
            })
        });
    });
}
userSchema.methods.genToken = function () {
    let user = this;
    let role = 'user';
    let token = jwt.sign({
        _id: user._id.toHexString(),
        role: role,
        username: user.username,
        email: user.email,
        loc: user.location,
    }, SECRET_KEY).toString();
    user.tokens.push({role, token});

    return user.save().then(() => {
        return token;
    });
}
userSchema.statics.findByToken = function (token) {
    let user = this;
    let verified;

    try {
        verified = jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return Promise.reject();
    }

    return user.findOne({
        _id: verified._id,
        'tokens.token': token,
        'tokens.role': verified.role
    });

}
userSchema.pre('save', function (next) { //the arrow function changes the scope of 'this.' Just use function()
    let user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});
const User = mongoose.model('User', userSchema);

module.exports = {
    User
}