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
            res.json({User})
   }));

 module.exports = router;