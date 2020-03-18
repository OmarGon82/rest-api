// Course
// id (Integer, primary key, auto-generated)
// userId (id from the Users table)
// title (String)
// description (Text)
// estimatedTime (String, nullable)
// materialsNeeded (String, nullable)

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class Course extends Sequelize.Model {}
    Course.init ({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'You must input a value for "title"',
                },
                notEmpty: {
                    msg: 'You must input a value for "title"',
                }
            }
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'You must input a value for "description"',
                },
                notEmpty: {
                    msg: 'You must input a value for "description"',
                }
            }
        },
        estimatedTime: {
            type: Sequelize.STRING,
            allowNull: true
        },
        materialsNeeded: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, { sequelize });
    Course.associate = (models) => {
        Course.belongsTo(models.Users, {
            as: 'user',
            foreignKey: {
                fieldName
            }
        })
    };

    return Course;
};