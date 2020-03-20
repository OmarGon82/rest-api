'use strict';

/**
 * Import: express and express Router. 
 * Import: models (using destructuring).
 */
const express =  require('express');
const router = express.Router();
const { User, Course } = require('./models')


// Import: methods from express-validator
const {check, validationResult } = require('express-validator')

// Import: bcrypts module;
const bcryptjs = require('bcryptjs');


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
    router.get('/users', 
    // [
    //     check('firstName')
    //         .exists({ checkFalsy: true, checkNull: true})
    //         .withMessage('Please provide a value for "firstName"'),
    //     check('lastName')
    //         .exists({ checkFalsy: true, checkNull: true})
    //         .withMessage('Please provide a value for "lastName"'),
    //     check('emailAddress')
    //         .exists({ checkFalsy: true, checkNull: true})
    //         .withMessage('Please provide a value for "emailAddress"'),
    //     check('password')
    //         .exists({ checkFalsy: true, checkNull: true})
    //         .withMessage('Please provide a value for "password"'),
    //    ],
        handleAsync(async (req, res) => {
              
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

        // // Hash the new user's password.
        // user.password = bcryptjs.hashSync(user.password);

        res.json(users.map(user=> user.get({ plain: true })))
        res.status(201).end();
           
       }));

   /**
    * Post route to create a new User
    */
   router.post('/users', 
   [
    check('firstName')
        .exists({ checkFalsy: true, checkNull: true})
        .withMessage('Please provide a value for "firstName"'),
    check('lastName')
        .exists({ checkFalsy: true, checkNull: true})
        .withMessage('Please provide a value for "lastName"'),
    check('emailAddress')
        .exists({ checkFalsy: true, checkNull: true})
        .withMessage('Please provide a value for "emailAddress"'),
    check('password')
        .exists({ checkFalsy: true, checkNull: true})
        .withMessage('Please provide a value for "password"'),
   ], 
   handleAsync(async (req, res) => {
          
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
    } else {
        // Get user from the request body.
        const user = req.body
        // Hash the new user's password.
        user.password = bcryptjs.hashSync(user.password);
        await User.create(user)
        console.log("user successfully created!")
        res.status(201).location('/').end();
    }     
}));

//send a DELETE request to /user/:id to DELETE a user.
// router.delete("/users/:id", handleAsync( async(req, res, next) => {
//     const user = await User.findByPk(req.params.id);
//     if(user) {
//         await User.destroy({
//             where: {
//                 id: user.id
//             }
//         })
//         res.status(204).end();
//     } else {
//         res.status(404).json({message: "user not found"})
//     }

// }));

   router.get('/courses', handleAsync(async (req, res) => {
    const courses = await Course.findAll();
    res.json(courses.map(course=> course.get({ plain: true })));
   }));


  


 module.exports = router;