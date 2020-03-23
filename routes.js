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

// Import: authentication modules;
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');


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
 *  Middleware function to authenticate users
 * @param {  req, res, next }
 */
    const authenticateUser  = handleAsync( async (req, res, next) => {
        let message = null; 

        // Parse users credentials from Authentication header
        const credentials = auth(req);

        // If users credentials exist
        if (credentials) {
            // Attempt to get the user from the db
            // by their email address (would be most unique way other than by pk, which the user wouldn't know)
            const users = await User.findAll()
            const user = users.find(user => user.emailAddress === credentials.name)
            // console.log(credentials.name)
            if(user) {
                // Use bcrypt compare the entered pw with the db pw
                const authenticated = bcryptjs.compareSync(credentials.pass, user.password);

                // If the pws match then 
                if (authenticated) {
                    // store the the retrieved user object on the req object so the next middleware has access to it
                    req.currentUser = user;

                } else {
                    message = `Authentication failure for username: ${user.emailAddress}`;
                }
            } else {
                message = `User not found for username: ${credentials.name}`;
            }
        } else {
            message = `Auth header not found`;
        }

        // If user authentication failed...
        if (message) {
            console.warn(message);
            //Return a response with a 401 Unauthorized HTTP status code.
            res.status(401).json({ message: 'Access Denied' });
        } else {
            // Or if the authentication was successful
            next();
        }  
    });

    // Route that returns the current authenticated user.
    router.get('/users', authenticateUser, handleAsync(async (req, res) => {
        const user = req.currentUser;
  
        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddress: user.emailAddress,
        });
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
        console.log("User successfully created!")
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

/**
 *  Course GET: Gets a list of all the coureses and users who owns each course.
 */
router.get('/courses', handleAsync(async (req, res) => {
const courses = await Course.findAll();
res.json(courses.map(course=> course.get({ plain: true })));
}));

/**
 * Course GET: Gets a single course and the user who owns that course.
 */
router.get('/courses/:id', handleAsync(async (req,res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if(course) {
           res.json(course);
           res.status(201).end();
        } else {
            res.status(404).json({ message: "Sorry that course does not exist" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}));

/**
 * Course POST: Creates a new post
 */

 router.post('/courses', [
    check('title')
    .exists({ checkFalsy: true, checkNull: true})
    .withMessage('Please provide a value for "title"'),
    check('description')
    .exists({ checkFalsy: true, checkNull: true})
    .withMessage('Please provide a value for "description"'),

 ], handleAsync(async (req, res) => {

    // Attempt get validation result from req obj
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessage = errors.array().map( error => error.msg);
        
        // return the error to the client
        return res.status(400).json({ errors: errorMessage})
    } else {
        const course = req.body;
        await Course.create(course)
        console.log("Course successfully created!")
        res.status(201).location('/course').end();
    }
 }));

//  PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/courses/:id', handleAsync(async (req,res) => {
    const course = await Course.findByPk(req.params.id);
    if(course) {
        course.title = req.body.title;
        course.description = req.body.description;

        await course.save();
        //with status 204 we don't usually send back json but we can use .end() to let end the request.
        res.status(204).end();
    } else {
        res.status(404).json({ message: "Course not found" })
    }  
}));

module.exports = router;