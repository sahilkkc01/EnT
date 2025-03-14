
const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../db");

const Hotel = sequelize.define('Hotel', {
    app_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    hotelName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(5), // Assuming state codes like 'AN', 'KA'
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    starCategory: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    totalRooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventVenue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roomTypes: {
      type: DataTypes.JSON, // Stores array of objects
      allowNull: false,
    },
    contacts: {
      type: DataTypes.JSON, // Stores array of objects
      allowNull: false,
    },
    hotelImage: {
        type: DataTypes.STRING,
      },
    status: {
        type:DataTypes.BOOLEAN,
        defaultValue:1
      }
  });
// Hotel.sync()
  module.exports={Hotel}