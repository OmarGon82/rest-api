'use strict';

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,   
            autoIncrement: true,
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'You must input a value for "firstName"',
                },
                notEmpty: {
                    msg: 'You must input a value for firstName'
                }
            }
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'You must input a value for "lastName"',
                },
                notEmpty: {
                    msg: 'You must input a value for "lastName"',
                }
            }
        },
        emailAddress: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: {
                args: true,
                msg: 'Email address entered is already in use.'
            },
            validate: {
                isEmail: {
                    args: true,
                    msg: 'Please enter a valid email address'
                },
                notNull: {
                    msg: 'You must input a value for "emailAddress"',
                },
                notEmpty: {
                    msg: 'You must input a value for "emailAddress"',
                }
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'You must input a value for "password"',
                },
                notEmpty: {
                    msg: 'You must input a value for "password"',
                }
            }
        },
    }, { sequelize });
   User.associate = (models) => {
    User.hasMany(models.Course, {
        as: 'user',
        foreignKey: {
            fieldName: "userId",
            field: 'userId',
            allowNull: false,
        }
    })
}
    return User;
};