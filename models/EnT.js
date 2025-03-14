const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../db");


const UserTokens = sequelize.define(
  "usertokens",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jwtToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "usertokens",
  }
);
// UserTokens.sync()
const Department = sequelize.define(
    "Department",
    {
      app_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      alter: true,
      tableName: "department",
    }
  );
// Department.sync()
module.exports={Department,UserTokens}