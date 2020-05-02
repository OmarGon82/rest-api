REST API Project
The app.js file configures Express to serve a simple REST API. We've also configured the morgan npm package to log HTTP requests/responses to the console. You'll update this file with the routes for the API.
The nodemon.js file configures the nodemon Node.js module, which we are using to run your REST API.
The package.json file (and the associated package-lock.json file) contain the project's npm configuration, which includes the project's dependencies.
The RESTAPI.postman_collection.json file is a collection of Postman requests that you can use to test and explore your REST API.
Getting Started
To get up and running with this project, run the following commands from the root of the folder that contains this README file.

First, install the project's dependencies using npm.

npm install

Second, seed the SQLite database.

npm run seed
And lastly, start the application.

npm start
To test the Express server, browse to the URL http://localhost:5000/.
This is a REST API I created as part of a full stack project for the www.teamtreehouse.com Full-Stack Tech Degree.

****************
****My notes****
****************

This REST API was created using Express and it provides a  way for users to adminster a school database containing information about courses.
Users can retrieve a list of courses, add upddate and delete courses. Users can make their own account and log-in and update and delete only coureses they 
own. This is the first part of a full-stack project where I will create a client for this REST API using React.


