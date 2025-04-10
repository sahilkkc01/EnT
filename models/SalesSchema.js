const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../db");


const SalesTeam = sequelize.define(
  "SalesTeam",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    emp_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emp_username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    states: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    cities: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "salesteam",
  }
);
// SalesTeam.sync()
module.exports = {
  SalesTeam
};
