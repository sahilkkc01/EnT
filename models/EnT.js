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
const TransportType = sequelize.define(
  "TransportType",
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
    tableName: "transporttype",
  }
);
const VendorType = sequelize.define(
  "VendorType",
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
    tableName: "vendortype",
  }
);

const Company = sequelize.define(
  "Company",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    regNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [10, 10],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gstNumber: {
      type: DataTypes.STRING, // Storing as a comma-separated string
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Active",
    },
    regDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "companies",
  }
);
const Documents = sequelize.define('Documents', {
  filename: {
      type: DataTypes.STRING,
      allowNull: false
  },
  status: {
      type: DataTypes.STRING,
      defaultValue: "Pending"
  },
  notes: {
    type: DataTypes.STRING,
  
}
}, {
  timestamps: true,
  tableName:'documents'
});

const UserPermissions = sequelize.define(
  "UserPermission",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    emp_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    alter: true,
    tableName: "userpermissions",
  }
);
// UserPermissions.sync()
// Documents.sync({force:true})
// Company.sync()
// VendorType.sync()
// TransportType.sync()
// Department.sync()
// sequelize.sync({ force: true });
module.exports = { Department, UserTokens, TransportType, VendorType, Company,Documents,UserPermissions };
