
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
  },
  {
    timestamps: true,
    alter: true,
    tableName: "hotels",
  }
);

const Vendor = sequelize.define('Vendor', {
  app_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vendorName: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  contactPerson: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  email: {
      type: DataTypes.STRING,
      allowNull: true,
  },
  state: {
      type: DataTypes.STRING(5),
      allowNull: false,
  },
  city: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  vendorType: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  contacts: {
      type: DataTypes.JSON, // Stores multiple contact persons [{ poc: 'John', pocName: 'Doe', contact: '1234567890' }]
      allowNull: true,
  },
  services: {
      type: DataTypes.JSON, // Stores service details [{ serviceName: 'Service A', avgRent: 500, serviceDetails: 'Details' }]
      allowNull: true,
  },
  vendorRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 }
  },
  vendorPortfolio: {
      type: DataTypes.STRING,
      allowNull: true,
  },
  vendorStatus: {
      type: DataTypes.ENUM('Active', 'Inactive', 'Blacklisted'),
      defaultValue: 'Active',
      allowNull: false,
  },
  vendorNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
  },
  nationalService: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
  },
  accNumber: {
      type: DataTypes.STRING,
      allowNull: true,
  },
  accType: {
      type: DataTypes.ENUM('','GST', 'NON-GST'),
      allowNull: true,
  },
  gstNumber: {
      type: DataTypes.STRING,
      allowNull: true,
  }
}, {
  timestamps: true,
  tableName: "vendors",
});



// Vendor.sync({alter:true})
// Hotel.sync()
  module.exports={Hotel,Vendor}