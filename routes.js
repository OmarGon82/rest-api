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
            if(user) {
                // Use bcrypt compare the entered password with the database password
                const authenticated = bcryptjs.compareSync(credentials.pass, user.password);

                // If the passwords match 
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
    /**
     * GET route returns the current authenticated user.
     */
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
    * Post route to creates a new User
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
        .isEmail()
        .withMessage('Please enter a valid email address')
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
     * isEmpty() returns true if there are no errors so to check if there are errors we use !(NOT operator) 
     * If there are validation errors
     */
    if (!errors.isEmpty()) {

        const errorMessage = errors.array().map(error => error.msg);
  
        // return the error to the client
        return res.status(400).json({ errors: errorMessage})
    } else {
        // Get the user from the request body.
        const user = req.body
        // Hash the new user's password.
        user.password = bcryptjs.hashSync(user.password);
        await User.create(user)
        console.log("User successfully created!")
        res.status(201).location('/').end();
    }     
}));
/**
 * DELETE route. Deletes a user
*/
router.delete("/users/:id", handleAsync( async(req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if(user) {
        await User.destroy({
            where: {
                id: user.id
            }
        })
        res.status(204).end();
    } else {
        res.status(404).json({message: "user not found"})
    }
}));

/************************
 * Course Routing Below *
 * **********************
 */


/**
 *  Course GET: Gets a list of all the coureses and users who owns each course.
 */
router.get('/courses', handleAsync(async (req, res) => {
const courses = await Course.findAll({
    // Set attributes I want to bring back from the database.
    attributes: ['id', 'title', 'description', "estimatedTime", "materialsNeeded"],
    include : [
        {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'emailAddress']
        },

    ]
});
res.json(courses.map(course=> course.get({ plain: true })));
}));

/**
 * Course GET: Gets a single course and the user who owns that course.
 */
router.get('/courses/:id', handleAsync(async (req,res) => {
    try {
        const course = await Course.findOne ({
            where: { id: req.params.id},
            attributes: ['id', 'title', 'description', "estimatedTime", "materialsNeeded"],
            include : [
                {
                model: User,
                as: 'user',
                attributes: [ 'id',  'firstName', 'lastName', 'emailAddress']
                }
            ]
        });
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

 ],authenticateUser, handleAsync(async (req, res) => {
     // Get the Id of the logged in user
    const user = req.currentUser;
    // Attempt get validation result from req obj
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessage = errors.array().map( error => error.msg);
        
        // return the error to the client
        return res.status(400).json({ errors: errorMessage})
    } else {
        if(parseInt(req.body.userId) === user.id) {
            const course = await Course.create(req.body)
             console.log("Course successfully created!")
             res.status(201).location(`/courses/${course.id}`).json();
        } else {
            return res.status(401).json({ message: "Access Denied"})
        } 
    }
 }));

/**
 * Course PUT: Put route to update an existing course
 */
router.put('/courses/:id',[
    check('title')
    .exists({ checkFalsy: true, checkNull: true})
    .withMessage('Please provide a value for "title"'),
    check('description')
    .exists({ checkFalsy: true, checkNull: true})
    .withMessage('Please provide a value for "description"'),

 ],authenticateUser, handleAsync(async (req,res) => {

        // Attempt get validation result from req obj
    const errors = validationResult(req);
    const course = await Course.findByPk(req.params.id);
    const user = req.currentUser;
    if (!errors.isEmpty()) {
        const errorMessage = errors.array().map( error => error.msg);
        
        // return the error to the client
        return res.status(400).json({ errors: errorMessage})
    } else {
        if(course.userId !== user.id) {
            res.status(403).json({ message: "Current user doesn't own the requested course" })
        } else if (course) {
            course.title = req.body.title;
            course.description = req.body.description;
    
            await course.save();
            //with status 204 we don't usually send back json but we can use .end() to end the request.
            res.status(204).end();
        } else {
            res.status(404).json({ message: "Course not found" })
        }  
    }
}));

/**
 * Course DELETE: Delete route to delete an existing course
 */
router.delete('/courses/:id', authenticateUser, handleAsync(async (req, res, next) => {
    const user = req.currentUser;
    const course = await Course.findByPk(req.params.id);
    if(course.userId !== user.id) {
        res.status(403).json({ message: "Current user doesn't own the requested course" })
    } else if (course) {
        await course.destroy();
        res.status(204).end();
    } else {
        res.status(404).json({ message: "Course not found" })
    }
}));

module.exports = router;