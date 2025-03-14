const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../db");

const Employee = sequelize.define(
    "Employee",
    {
      app_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("M", "F", "O"),
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isNumeric: true,
          len: [10, 15],
        },
      },
      email: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      dept: {
        type: DataTypes.STRING,
      },
      desg: {
        type: DataTypes.STRING,
      },
      doj: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      qualification: {
        type: DataTypes.STRING,
      },
      exp: {
        type: DataTypes.STRING,
      },
      shiftTimming: {
        type: DataTypes.STRING,
      },
      emerCont: {
        type: DataTypes.STRING,
      },
      emerContMobile: {
        type: DataTypes.STRING,
      },
      empImage: {
        type: DataTypes.STRING,
      },
      master: {
        type: DataTypes.BOOLEAN,
        defaultValue:0
      },
      status: {
        type:DataTypes.BOOLEAN,
        defaultValue:1
      }
    },
    {
      timestamps: true,
      alter: true,
      tableName: "employees",
    }
  );
// Employee.sync({force:true})
  module.exports={Employee}