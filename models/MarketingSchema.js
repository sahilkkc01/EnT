const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../db");

const Client = sequelize.define(
  "Client",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clientType: {
      type: DataTypes.ENUM("individual", "corporate", "key-account"),
      allowNull: true,
    },
    registrationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [10, 15], // Ensures phone number has between 10-15 characters
      },
    },
    secondaryPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [10, 15],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "India",
    },
    clientCategory: {
      type: DataTypes.ENUM("event", "tour", "both"),
      allowNull: true,
    },
    clientSource: {
      type: DataTypes.ENUM(
        "website",
        "referral",
        "social-media",
        "walk-in",
        "exhibition",
        "existing-client",
        "other"
      ),
      allowNull: true,
    },
    preferredContact: {
      type: DataTypes.ENUM("phone", "email", "whatsapp", "in-person"),
      allowNull: true,
      defaultValue: "phone",
    },
    preferredTime: {
      type: DataTypes.ENUM("morning", "afternoon", "evening", ""),
      allowNull: true,
      defaultValue: "",
    },
    clientRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clientStatus: {
      type: DataTypes.ENUM("prospect", "active", "inactive", "blacklisted"),
      allowNull: true,
      defaultValue: "prospect",
    },
    priority: {
      type: DataTypes.ENUM("vip", "high", "medium", "low"),
      allowNull: true,
      defaultValue: "medium",
    },
    clientSince: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gstNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    panNumber: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pocDetails: {
      type: DataTypes.JSON, // Stores POC details: [{ name: "RAM", designation: "RECEPTION", contact: "8787878834" }, ...]
      allowNull: true,
    },
    serviceDetails: {
      type: DataTypes.JSON, // Stores service details: [{ service: "S2", serviceDate: "2025-03-26" }, ...]
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "clients",
  }
);
// Client.sync({ force: true });

// ClientFollowUp model
const ClientFollowUp = sequelize.define(
  "ClientFollowUp",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nextFollowUpTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    empName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed", "Closed"),
      defaultValue: "Pending",
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "client_followups",
  }
);
// ClientFollowUp.sync()
// ClientInteraction model
const ClientInteraction = sequelize.define(
  "ClientInteraction",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    interaction_type: {
      type: DataTypes.ENUM("phone", "email", "meeting", "site-visit"),
      allowNull: false,
    },
    interaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    outcome: {
      type: DataTypes.ENUM("Positive", "Neutral", "Negative"),
      allowNull: false,
    },
    leadGenerated: {
      type: DataTypes.ENUM("No", "Yes"),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    empName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "client_interactions",
    timestamps: true,
  }
);
// ClientInteraction.sync({force:true})
// ClientService model
const ClientService = sequelize.define(
  "ClientService",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_type: {
      type: DataTypes.ENUM("Event", "Tour", "Both"),
      allowNull: false,
    },
    service_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    service_details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    budget: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attendees: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    empName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Planned", "In Progress", "Completed", "Cancelled"),
      defaultValue: "Planned",
      allowNull: false,
    },
  },
  {
    tableName: "client_services",
    timestamps: true,
  }
);
// ClientService.sync()
// ClientTeamAssignment model
const ClientTeamAssignment = sequelize.define(
  "ClientTeamAssignment",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team_member_username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    team_member_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "client_team_assignments",
  }
);
// ClientTeamAssignment.sync()
// ClientDocument model
const ClientDocument = sequelize.define(
  "ClientDocument",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    document_type: {
      type: DataTypes.ENUM("Contract", "Invoice", "Proposal", "Other"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    empName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "client_documents",
  }
);
// ClientDocument.sync()
const Lead = sequelize.define(
  "Lead",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    requirement: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    people_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lead_source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lead_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("high", "medium", "low", "urgent"),
      allowNull: false,
    },
    next_followup: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    additional_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_followup: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "leads",
  }
);
const LeadFollowUp = sequelize.define(
  "LeadFollowUp",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nextFollowUpTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    empName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed", "Closed"),
      defaultValue: "Pending",
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "lead_followups",
  }
);
// LeadFollowUp.sync()

const LeadInteraction = sequelize.define(
  "LeadInteraction",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    interaction_type: {
      type: DataTypes.ENUM("phone", "email", "meeting", "site-visit"),
      allowNull: false,
    },
    interaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    outcome: {
      type: DataTypes.ENUM("Positive", "Neutral", "Negative"),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    empName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "lead_interactions",
    timestamps: true,
  }
);
// LeadInteraction.sync()

const LeadTeamAssignment = sequelize.define(
  "LeadTeamAssignment",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team_member_username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    team_member_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "lead_team_assignments",
  }
);
// LeadTeamAssignment.sync()

const LeadQuotation = sequelize.define(
  "LeadQuotation",
  {
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Accepted", "Not Accepted"),
      allowNull: false,
      defaultValue: "Not Accepted",
    },
    sentBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "lead_quotation",
  }
);

const MarketingTeam = sequelize.define(
  "MarketingTeam",
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
    tableName: "marketingteam",
  }
);
// MarketingTeam.sync({force:true})
// LeadQuotation.sync()
module.exports = {
  Client,
  ClientFollowUp,
  ClientInteraction,
  ClientService,
  ClientTeamAssignment,
  ClientDocument,
  Lead,
  LeadFollowUp,
  LeadInteraction,
  LeadTeamAssignment,
  LeadQuotation,
  MarketingTeam
};
