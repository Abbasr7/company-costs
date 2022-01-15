const config = require('config');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const store = require('store');
const jwt = require('jsonwebtoken');
// const join = require('joi');

const { User } = require('./models/user');
const { JobTitle } = require('./models/job_title');
const { Levels } = require('./models/members_level.js');
const { Estimate } = require('./models/estimate.js');
const { Unit } = require('./models/unit.js');
const { authenticate } = require('./middelware/authenticate');

const SECRET_KEY = config.get('JWT_SICRET');

const errorHandle = (res, e, message) => {
    let msg = message ? message : 'Something is wrong...';
    console.log(msg, e);
    res.status(400).json({
        Error: `${msg} ${e}`
    });
};
const successHandle = (res, e, message) => {
    let msg = message ? message : 'Successful :)';
    // console.log(msg, e);
    res.status(200).json({
        Message: `${msg}`,
        data: e
    });
};

router.get('/', async(req, res) => {
    let token = store.get('userinfo');
    let decoded, tasks;
    if (token) {
        decoded = jwt.verify(token, SECRET_KEY);
        tasks = await ToDo.find({
            userid: decoded._id
        }).exec();
    }
    let username = decoded ? decoded.username : null;
    res.render('index', {
        title: 'My ToDo app',
        test: 'BESMELLAH ARRAHMAN ARRAHIM',
        token: token,
        name: username,
        tasks: tasks,
        // msg: msg
    });
});

// Register & Login
router.get('/api/login', async(req, res) => {
    let token = store.get('userinfo');
    if (token) {
        // let msg = encodeURIComponent('You are logged in.');
        req.msg = 'You are logged in.';
        res.redirect('/');
    } else {
        res.render('parts/login', {
            title: 'My ToDo app',
            test: 'BESMELLAH ARRAHMAN ARRAHIM',
        });
    }
});
router.post('/api/register', async(req, res) => {
    let data = _.pick(req.body, ['username', 'email', 'password', 'location']);
    try {
        let user = new User(data);
        await user.save();
        let token = await user.genToken();

        if (!user) {
            res.status(400).send(user)
        }
        if (user && token) {
            store.set('userinfo', token);
            res.redirect('/panel')
        }
    } catch (e) {
        errorHandle(res, e);
    }
});
router.post('/api/login', async(req, res) => {
    try {
        let data = _.pick(req.body, ['username', 'password']);
        let user = await User.findByUsername(data.username, data.password);
        let token = await user.genToken();
        if (!user) {
            res.render('parts/login', {
                msg: "نام کاربری یا رمز عبور اشتباه است."
            })
        }
        store.set('userinfo', token);
        let referred = store.get('referredUrl');
        if (referred) {
            res.redirect(`${referred}`);
        } else {
            res.redirect('/panel');
        }

    } catch (e) {
        res.render('parts/login', {
            msg: "نام کاربری یا رمز عبور اشتباه است.",
            e: e
        });
    }
});
router.get('/api/logout', authenticate, async(req, res) => {
    let token = store.get('userinfo');
    try {
        let user = await User.findOneAndUpdate({
            _id: req.user._id
        }, {
            $pull: {
                tokens: {
                    token: token
                }
            }
        });

        if (!user) {
            res.status(400).json({
                "Error": `user not found! ${user}`
            });
        }
        store.remove('userinfo');
        // store.clearAll()
        res.redirect('/')
    } catch (e) {
        errorHandle(res, e);
    }
})

// Dashboard
router.get('/panel/', authenticate, async(req, res) => {
        res.render('dashboard');
    })
    //job titles
router.get('/panel/jobtitles', authenticate, async(req, res) => {

    let jobTitles = await JobTitle.find({
        userid: req.user._id.toHexString()
    }).sort({ date: -1 }).exec();

    res.render('parts/panel/job_titles', {
        ispart: req.query.ispart,
        jobTitles: jobTitles
    });
})
router.post('/panel/jobtitles', authenticate, async(req, res) => {
    try {
        let data = _.pick(req.body, ['title', 'desc', 'status']);
        data.userid = req.user._id.toHexString();

        let savedata = await JobTitle.saveJobTitle(req.token, data);
        successHandle(res, savedata, 'sabt shod.');
    } catch (e) {
        errorHandle(res, e);
    }
});
router.delete('/panel/jobtitles', authenticate, async(req, res) => {
    try {
        let deleteItem = await JobTitle.deleteOne({
            _id: req.body._id
        });
        successHandle(res, deleteItem, 'hazf shod.');
    } catch (e) {
        errorHandle(res, e);
    }
});
router.put('/panel/jobtitles', authenticate, async(req, res) => {
    try {
        let data = await JobTitle.findOne({ _id: req.body._id });
        let status = data.status == 'on' ? 'off' : 'on';
        let operation = await JobTitle.findOneAndUpdate({
            _id: req.body._id
        }, {
            status: status
        });
        successHandle(res, status, `${status} shod.`);
    } catch (e) {
        errorHandle(res, e);
    }
});

//levels
router.get('/panel/levels', authenticate, async(req, res) => {

    let levels = await Levels.find({
        userid: req.user._id.toHexString()
    }).sort({ date: -1 }).exec();

    res.render('parts/panel/levels', {
        ispart: req.query.ispart,
        levels: levels
    });
})
router.post('/panel/levels', authenticate, async(req, res) => {
    try {
        let data = _.pick(req.body, ['title', 'desc', 'status']);
        data.userid = req.user._id.toHexString();

        let savedata = await Levels.saveLevel(req.token, data);
        successHandle(res, savedata, 'sabt shod.');
    } catch (e) {
        errorHandle(res, e);
    }
})
router.delete('/panel/levels', authenticate, async(req, res) => {
    try {
        let deleteItem = await Levels.deleteOne({
            _id: req.body._id
        });
        successHandle(res, deleteItem, 'hazf shod.');
    } catch (e) {
        errorHandle(res, e);
    }
});
router.put('/panel/levels', authenticate, async(req, res) => {
    try {
        let data = await Levels.findOne({ _id: req.body._id });
        let status = data.status == 'on' ? 'off' : 'on';
        let operation = await Levels.findOneAndUpdate({
            _id: req.body._id
        }, {
            status: status
        });
        successHandle(res, status, `${status} shod.`);
    } catch (e) {
        errorHandle(res, e);
    }
});
// Estimate
router.get('/panel/estimate', authenticate, async(req, res) => {

    let estimate = await Estimate.find({
        userid: req.user._id.toHexString()
    }).sort({ date: -1 }).exec();

    let jobTitles = await JobTitle.find({
        userid: req.user._id.toHexString()
    }).sort({ date: -1 }).exec();

    let levels = await Levels.find({
        userid: req.user._id.toHexString()
    }).sort({ date: -1 }).exec();

    let unit = await Unit.find({
        userid: req.user._id.toHexString()
    }).sort({ date: -1 }).exec();

    res.render('parts/panel/estimate', {
        ispart: req.query.ispart,
        levels: levels,
        jobTitles: jobTitles,
        data: estimate,
        unit: unit
    });
})
router.post('/panel/estimate', authenticate, async(req, res) => {
    try {
        let data = _.pick(req.body, ['unit', 'jobTitle', 'level', 'count', 'salary', 'minsalary']);
        data.userid = req.user._id.toHexString();
        let isthere = await Estimate.findOne({
            unit: data.unit,
            jobTitle: data.jobTitle,
            level: data.level
        }).exec();

        isthereUnit = await Unit.find({
            userid: data.userid,
            unit: data.unit
        })
        if (isthereUnit.length == '0') {
            let unit = {
                userid: data.userid,
                unit: data.unit
            }
            await Unit.saveUnit(req.token, unit);
        }
        let savedata = await Estimate.saveUnit(req.token, data);
        successHandle(res, savedata, 'sabt shod');

    } catch (e) {
        errorHandle(res, e);
    }
})
router.delete('/panel/estimate', authenticate, async(req, res) => {
    try {
        let deleteItem = await Estimate.deleteOne({
            _id: req.body._id
        });
        isthereUnit = await Estimate.find({
            unit: req.body.unit
        });
        if (isthereUnit.length == '0') {
            await Unit.deleteOne({
                unit: req.body.unit
            });
        }
        successHandle(res, [deleteItem, isthereUnit.length], 'hazf shod.');
    } catch (e) {
        errorHandle(res, e);
    }
});
router.post("/panel/toestimate", authenticate, async(req, res) => {
    try {
        let unit = req.body.unit;
        let data = await Estimate.find({
            userid: req.user._id.toHexString(),
            unit: unit
        }).sort({ date: -1 }).exec();

        const reducer = (previousValue, currentValue) => previousValue + currentValue;
        const numWcomma = (x) => {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        let bime = (salary) => {
                return salary * 23 / 100;
            },
            eydi = (salary, minsalary, count) => {
                if ((salary / count) * 2 < minsalary) {
                    return (salary / count) * 2 * count;
                } else {
                    return minsalary * count;
                }
            },
            padash = (salary, count) => {
                return 2 * salary * count
            };
        let table = '',
            sumTable = '',
            sumCost = {
                salary: [],
                bime: [],
                padash: [],
                eydi: [],
                count: []
            };
        let estimatedData = [];
        for (let i of data) {
            var newObj = {};
            newObj.jobTitle = i.jobTitle;
            table += `<tr> <td>${i.jobTitle}</td>`;
            newObj.level = i.level;
            newObj.count = i.count;
            table += `<td>${i.level}</td><td>${i.count}</td>`;
            newObj.yaerlySalary = i.salary * i.count * 12;
            table += `<td>${numWcomma(newObj.yaerlySalary)}</td>`;
            newObj.yearlyBime = bime(i.salary) * 12 * i.count;
            table += `<td>${numWcomma(newObj.yearlyBime)}</td>`;
            newObj.padash = padash(i.salary, i.count);
            table += `<td>${numWcomma(newObj.padash)}</td>`;
            newObj.eydi = eydi(i.salary, i.minsalary, i.count);
            table += `<td>${numWcomma(newObj.eydi)}</td>
                <td> ${numWcomma([i.salary * i.count ,bime(i.salary) * i.count].reduce(reducer))} </td>
                <td> ${numWcomma([newObj.yaerlySalary,newObj.yearlyBime,newObj.padash,newObj.eydi].reduce(reducer))} </td> </tr>`;
            estimatedData.push(newObj);
            // console.log(newObj);
        }
        for (let [i, v] of estimatedData.entries()) {
            sumCost.salary[i] = v.yaerlySalary;
            sumCost.bime[i] = v.yearlyBime;
            sumCost.padash[i] = v.padash;
            sumCost.eydi[i] = v.eydi;
            sumCost.count[i] = v.count;
        }
        sumTable = `<tr> <td> ${sumCost.count.reduce(reducer)} </td>
            <td> ${numWcomma(sumCost.salary.reduce(reducer))} </td>
            <td> ${numWcomma(sumCost.bime.reduce(reducer))} </td>
            <td> ${numWcomma(sumCost.padash.reduce(reducer))} </td>
            <td> ${numWcomma(sumCost.eydi.reduce(reducer))} </td>
            <td> ${numWcomma([sumCost.eydi.reduce(reducer),sumCost.salary.reduce(reducer),sumCost.bime.reduce(reducer),sumCost.padash.reduce(reducer)].reduce(reducer))} </td> </tr>`;

        // console.log(estimatedData, sumCost);
        successHandle(res, [table, sumTable]);
    } catch (e) {
        errorHandle(res, e);
    }
});

module.exports = router;