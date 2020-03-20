'use strict';

/**
 * Importing express and express Router. 
 * Importing models using destructuring.
 */
const express =  require('express');
const router = express.Router();
const { User, Course } = require('./models')


// Importing methods from express-validator
const {check, validationResult } = require('express-validator')

const nameValidator = check('name')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('Please providea value for "name"');


/**
 * Middleware function to wrap each route in a try catch block
 * @param {callback function} cb 
 */
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
    /**
     * GET route to get all the users information from the database
     */
   router.get('/users', handleAsync(async (req, res) => {
    const users = await User.findAll();
        res.json(users.map(user=> user.get({ plain: true })))
       
   }));

   /**
    * Post route to validate All users
    */
   router.post('/users', [
    check('firstName')
        .exists({ checkFalsy: true, checkNull: true})
        .withMessage('Please provide a value for "firstName"'),
    check('lastName')
        .exists({ checkFalsy: true, checkNull: true})
        .withMessage('Please provide a value for "lastName"'),
    check('emailAddress')
        .exists({ checkFalsy: true, checkNull: true})
        .withMessage('Please provide a value for "emailAddress"'),
   ], handleAsync(async (req, res) => {
          
    // Attempt to get the validation  result from the Request  object.
    const errors = validationResult(req)

    /**
     * isEmpty returns true if there are no errors so to check if there are errors we use !(NOT operator)
     * If there are validation errors
     */
    if (!errors.isEmpty()) {
        const errorMessage = errors.array().map(error => error.msg);

        // return the error to the client
        return res.status(400).json({ errors: errorMessage})
    }

    // Get user from the request body.
    const users = await User.findAll();
        res.json(users.map(user=> user.get({ plain: true })))
        res.status(201).end();
       
   }));

   router.get('/courses', handleAsync(async (req, res) => {
    const courses = await Course.findAll();
    res.json(courses.map(course=> course.get({ plain: true })));
   }));


  


 module.exports = router;