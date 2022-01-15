const { User } = require('../models/user');
const store = require('store')

const authenticate = function(req, res, next) {
    let token = store.get('userinfo');

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.rerject();
        }

        req.user = user;
        req.token = token;

        next();
    }).catch((err) => {
        let referred = store.set('referredUrl', req.originalUrl);
        res.status(401).send('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/api/login"></head></html>');
    });
};

module.exports = {
    authenticate
}