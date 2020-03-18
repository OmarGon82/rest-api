const Sequelize = require('sequelize');


// testing sequelize connection
const sequelize = new Sequelize({
    dialect: 'sqlite',
    stoare: 'fsjstd-restapi.db'
  });

const db = {
    sequelize,
    Sequelize,
    models: {},
}

db.models.Users = require('./Users') (sequelize);
db.models.Users = require('./Courses') (sequelize);