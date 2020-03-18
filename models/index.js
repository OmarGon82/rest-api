const Sequelize = require('sequelize');


// testing sequelize connection
module.exports = new Sequelize({
    dialect: 'sqlite',
    stoare: 'fsjstd-restapi.db'
  });
