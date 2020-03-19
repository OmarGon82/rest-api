'use strict';

const express =  require('express');
const { sequelize, models } = require('./models');
const { User, Course } = ('./models');

// router
const router = express.Router();



function handleAsync(cb) {
    return async(req, res, next) => {
        try{
            await cb(req, res, next)
        } catch(error) {
            //passes the error to global error handler
            next(error)   
        }
    }
}

   router.get('/users', handleAsync(async (req, res) => {
       const users = await User.findAll({
           attribues: ['id']
       })
       res.json(users.map(user => user.get({ plain: true})));
   }));

 module.exports = router;