const config = require('config');
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const app = express();
const router = require('./router')

app.set('view engine', 'hbs'); // set hbs the default template engine
app.use(express.static(path.join(__dirname, 'views'))); //to use css files
hbs.registerPartials(path.join(__dirname, '/views/parts'));
app.use(express.urlencoded({ extended: false }));

// Helpers
hbs.registerHelper("numWcomma", function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});
hbs.registerHelper('if_eq', function(a, b, opts) {
    if (a == b)
        return opts.fn(this);
    else
        return opts.inverse(this);
});
hbs.registerHelper('trimWords', function(str, flag) {
    if (flag == '_') {
        return str.toString().replace(/\s/g, "_");
    } else if (flag == 's') {
        return str.toString().replace(/_/g, " ");
    }
});
app.use(router);

app.listen(config.get('PORT'), () => {
    console.log(`server is running in port ${config.get('PORT')}`);
});