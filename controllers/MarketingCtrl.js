const { Employee } = require("../models/HrSchema");
const {
  Client,
  ClientFollowUp,
  ClientInteraction,
  ClientTeamAssignment,
  ClientDocument,
  Lead,
  LeadFollowUp,
  LeadInteraction,
  LeadTeamAssignment,
  LeadQuotation,
  MarketingTeam,
} = require("../models/MarketingSchema"); // Adjust the path based on your project structure
const { Op } = require("sequelize");
const path = require("path");
const { sequelize } = require("../db");

exports.saveOrUpdateClient = async (req, res) => {
  console.log(req.body);
  try {
    const appId = req.user?.app_id;
    const username = req.user.username;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const {
      id,
      clientType,
      registrationDate,
      clientName,
      phoneNumber,
      secondaryPhone,
      email,
      address1,
      address2,
      state,
      city,
      postalCode,
      country,
      clientCategory,
      clientSource,
      preferredContact,
      preferredTime,
      clientRequirements,
      clientStatus,
      priority,
      clientSince,
      gstNumber,
      panNumber,
      internalNotes,
      pocDetails,
      serviceDetails,
    } = req.body;

    // Required fields validation
    if (
      !clientType ||
      !clientName ||
      !phoneNumber ||
      !email ||
      !address1 ||
      !state ||
      !city ||
      !postalCode ||
      !clientCategory ||
      !clientSource ||
      !preferredContact ||
      !clientRequirements
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Format arrays
    const formattedPocDetails = Array.isArray(pocDetails) ? pocDetails : [];
    const formattedServiceDetails = Array.isArray(serviceDetails)
      ? serviceDetails
      : [];

    // Check for duplicate client only if it's a new entry
    if (!id) {
      const existingClient = await Client.findOne({
        where: {
          clientName,
          phoneNumber,
          app_id: appId,
        },
      });

      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: "Client with the same name and phone number already exists",
        });
      }
    }

    const clientData = {
      app_id: appId,
      clientType,
      registrationDate:
        registrationDate || new Date().toISOString().split("T")[0],
      clientName,
      phoneNumber,
      secondaryPhone,
      email,
      address1,
      address2,
      state,
      city,
      postalCode,
      country: country || "India",
      clientCategory,
      clientSource,
      preferredContact,
      preferredTime: preferredTime || "",
      clientRequirements,
      clientStatus: clientStatus || "prospect",
      priority: priority || "medium",
      clientSince,
      gstNumber,
      panNumber,
      internalNotes,
      pocDetails: formattedPocDetails,
      serviceDetails: formattedServiceDetails,
      createdBy: username,
    };

    if (id) {
      const [updated] = await Client.update(clientData, {
        where: { id, app_id: appId },
      });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Client not found or unauthorized",
        });
      }
    } else {
      await Client.create(clientData);
    }

    return res.status(200).json({
      success: true,
      message: id
        ? "Client updated successfully"
        : "Client created successfully",
    });
  } catch (error) {
    console.error("Error saving/updating client:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all clients with pagination and filtering
exports.getAllClients = async (req, res) => {
  try {
    console.log(req.user)
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    let {
      page = 1,
      limit = 50,
      state,
      city,
      client_name,
      client_status,
      priority,
      client_type,
    } = req.query;
    page = Math.max(1, Number(page) || 1);
    limit = Math.max(10, Number(limit) || 50); // Minimum 10 records per page
    const offset = (page - 1) * limit;

    // Build filter conditions
    let whereCondition = { app_id: appId };
    if (state) whereCondition.state = state;
    if (city) whereCondition.city = city;
    if (client_name)
      whereCondition.clientName = { [Op.like]: `%${client_name}%` };
    if (client_status) whereCondition.clientStatus = client_status;
    if (priority) whereCondition.priority = priority;
    if (client_type) whereCondition.clientType = client_type;

    // Fetch paginated clients
    const { rows: clients, count: totalClients } = await Client.findAndCountAll(
      {
        where: whereCondition,
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      }
    );
    // console.log(clients);s

    if (!clients.length && page > 1) {
      // If no clients found on a page beyond the first, redirect to first page
      return res.redirect(`/clients?page=1`);
    }

    return res.status(200).json({
      success: true,
      clients,
      totalClients,
      totalPages: Math.ceil(totalClients / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update client status
exports.updateClientStatus = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { id } = req.params;
    const { clientStatus } = req.body;

    if (!clientStatus) {
      return res
        .status(400)
        .json({ success: false, message: "Client status is required" });
    }

    const [updated] = await Client.update(
      { clientStatus },
      { where: { id, app_id: appId } }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found or unauthorized" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Client status updated successfully" });
  } catch (error) {
    console.error("Error updating client status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update client priority
exports.updateClientPriority = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { id } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res
        .status(400)
        .json({ success: false, message: "Priority is required" });
    }

    const [updated] = await Client.update(
      { priority },
      { where: { id, app_id: appId } }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found or unauthorized" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Client priority updated successfully" });
  } catch (error) {
    console.error("Error updating client priority:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { id } = req.params;
    console.log(id);
    const client = await Client.findOne({
      where: { id, app_id: appId },
      include: [
        // Include any related models if needed
      ],
    });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    return res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Check if client exists
exports.checkClient = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in",
      });
    }

    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const client = await Client.findOne({
      where: {
        app_id: appId,
        [Op.or]: [
          { clientName: { [Op.like]: `%${query}%` } },
          { phoneNumber: query },
          { email: query },
        ],
      },
    });

    if (!client) {
      return res.json({
        exists: false,
      });
    }

    return res.json({
      exists: true,
      data: client,
    });
  } catch (error) {
    console.error("Error checking client:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Save client follow-up
exports.saveClientFollowUp = async (req, res) => {
  try {
    console.log(req.body);
    const appId = req.user?.app_id;
    const username = req.user?.username;
    const empName = req.user?.name;

    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { client_id, nextFollowUpTime, remark } = req.body;

    if (!client_id || !nextFollowUpTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const followUp = await ClientFollowUp.create({
      app_id: appId,
      client_id,
      nextFollowUpTime,
      remark,
      empName,
      username,
    });

    return res.status(200).json({
      success: true,
      message: "Follow-up saved successfully",
      data: followUp,
    });
  } catch (error) {
    console.error("Error saving client follow-up:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get follow-ups by client ID
exports.getClientFollowUps = async (req, res) => {
  console.log(req.body);
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { clientId } = req.params;
    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    const followUps = await ClientFollowUp.findAll({
      where: { client_id: clientId, app_id: appId },
      order: [["nextFollowUpTime", "ASC"]],
    });

    return res.status(200).json({ success: true, data: followUps });
  } catch (error) {
    console.error("Error fetching client follow-ups:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Save client interaction
exports.saveClientInteraction = async (req, res) => {
  console.log(req.body);
  const t = await sequelize.transaction();
  try {
    const appId = req.user?.app_id;
    const username = req.user?.username;
    const empName = req.user?.name;

    if (!appId) {
      await t.rollback();
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    // Destructure required interaction fields from request body
    const {
      client_id,
      interaction_type,
      interaction_date,
      notes,
      outcome,
      leadGenerated,
    } = req.body;

    if (!client_id || !interaction_type || !interaction_date || !outcome) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Create the client interaction record within the transaction
    const interaction = await ClientInteraction.create(
      {
        app_id: appId,
        client_id,
        interaction_type,
        interaction_date,
        notes,
        outcome,
        username,
        empName,
        leadGenerated,
      },
      { transaction: t }
    );

    let lead = null;
    // If lead is generated, create a lead record as well within the transaction
    if (leadGenerated === "Yes") {
      const {
        event_type,
        state,
        city,
        venue,
        event_date,
        requirement,
        people_count,
        lead_source,
        lead_status,
        priority,
        next_followup,
        additional_details,
      } = req.body;

      // Optionally, validate required lead fields
      if (
        !event_type ||
        !state ||
        !city ||
        !venue ||
        !event_date ||
        !requirement ||
        !people_count ||
        !lead_source ||
        !lead_status ||
        !priority ||
        !next_followup
      ) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Missing required lead fields" });
      }

      lead = await Lead.create(
        {
          app_id: appId,
          client_id,
          event_type,
          state,
          city,
          venue,
          event_date,
          requirement,
          people_count,
          lead_source,
          lead_status,
          priority,
          next_followup,
          additional_details,
          createdBy: username,
        },
        { transaction: t }
      );
    }

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Interaction logged successfully",
      data: { interaction, lead },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error saving client interaction:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get interactions by client ID
exports.getClientInteractions = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { clientId } = req.params;
    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    const interactions = await ClientInteraction.findAll({
      where: { client_id: clientId, app_id: appId },
      order: [["interaction_date", "DESC"]],
    });

    return res.status(200).json({ success: true, data: interactions });
  } catch (error) {
    console.error("Error fetching client interactions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Save client service
exports.saveClientService = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    const username = req.user?.username;
    const empName = req.user?.name;

    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const {
      client_id,
      service_type,
      service_date,
      service_details,
      budget,
      attendees,
      status,
    } = req.body;

    if (
      !client_id ||
      !service_type ||
      !service_date ||
      !service_details ||
      !budget ||
      !status
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const service = await ClientService.create({
      app_id: appId,
      client_id,
      service_type,
      service_date,
      service_details,
      budget,
      attendees,
      status,
      username,
      empName,
    });

    return res.status(200).json({
      success: true,
      message: "Service saved successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error saving client service:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get services by client ID
exports.getClientServices = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { clientId } = req.params;
    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    const services = await ClientService.findAll({
      where: { client_id: clientId, app_id: appId },
      order: [["service_date", "ASC"]],
    });

    return res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error("Error fetching client services:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getAllTeamMembers = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }
    const employees = await Employee.findAll({
      where: { app_id: appId },
      attributes: ["username", "name"],
    });

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Assign team member to client
exports.assignClientTeamMember = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { client_id, team_member_username, team_member_name, role } =
      req.body;

    if (!client_id || !team_member_username || !team_member_name || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const assignment = await ClientTeamAssignment.create({
      app_id: appId,
      client_id,
      team_member_username,
      team_member_name,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Team member assigned successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error assigning team member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get team members assigned to client
exports.getClientTeamAssignments = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { clientId } = req.params;
    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    const assignments = await ClientTeamAssignment.findAll({
      where: { client_id: clientId, app_id: appId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    console.error("Error fetching client team assignments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Upload client document
exports.uploadClientDocument = async (req, res) => {
  console.log(req.body);
  try {
    const appId = req.user?.app_id;
    const username = req.user?.username;
    const empName = req.user?.name;

    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { client_id, document_type, description } = req.body;
    const file_path = req.file
      ? path.basename(req.file.path)
      : existingEmployee.file_path;

    if (!client_id || !document_type || !file_path) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const document = await ClientDocument.create({
      app_id: appId,
      client_id,
      document_type,
      description,
      file_path,
      username,
      empName,
    });

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    console.error("Error uploading client document:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get client documents
exports.getClientDocuments = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { clientId } = req.params;
    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    const documents = await ClientDocument.findAll({
      where: { client_id: clientId, app_id: appId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    console.error("Error fetching client documents:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.removeClientTeamMember = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { clientId, assignmentId } = req.params;

    if (!clientId || !assignmentId) {
      return res.status(400).json({
        success: false,
        message: "Client ID and Assignment ID are required",
      });
    }

    // Verify the assignment belongs to the client and app
    const assignment = await ClientTeamAssignment.findOne({
      where: {
        id: assignmentId,
        client_id: clientId,
        app_id: appId,
      },
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Team assignment not found" });
    }

    // Delete the assignment
    await assignment.destroy();

    return res.status(200).json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getAllLeads = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    // Get filters and pagination params from query
    let {
      page = 1,
      limit = 50,
      state,
      city,
      event_type,
      lead_status,
      priority,
      client_id,
    } = req.query;
    page = Math.max(1, Number(page) || 1);
    limit = Math.max(10, Number(limit) || 50); // Minimum 10 records per page
    const offset = (page - 1) * limit;

    // Build filter conditions
    let whereCondition = { app_id: appId };
    if (state) whereCondition.state = state;
    if (city) whereCondition.city = city;
    if (event_type) whereCondition.event_type = event_type;
    if (lead_status) whereCondition.lead_status = lead_status;
    if (priority) whereCondition.priority = priority;
    if (client_id) whereCondition.client_id = client_id;

    // Fetch paginated leads
    const { rows: leads, count: totalLeads } = await Lead.findAndCountAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    if (!leads.length && page > 1) {
      // If no leads found on a page beyond the first, redirect to first page
      return res.redirect(`/leads?page=1`);
    }

    return res.status(200).json({
      success: true,
      leads,
      totalLeads,
      totalPages: Math.ceil(totalLeads / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Update lead status
exports.updateLeadStatus = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { id } = req.params;
    const { lead_status } = req.body;

    if (!lead_status) {
      return res
        .status(400)
        .json({ success: false, message: "Lead status is required" });
    }

    const [updated] = await Lead.update(
      { lead_status },
      { where: { id, app_id: appId } }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found or unauthorized" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Lead status updated successfully" });
  } catch (error) {
    console.error("Error updating lead status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update lead priority
exports.updateLeadPriority = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { id } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res
        .status(400)
        .json({ success: false, message: "Priority is required" });
    }

    const [updated] = await Lead.update(
      { priority },
      { where: { id, app_id: appId } }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found or unauthorized" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Lead priority updated successfully" });
  } catch (error) {
    console.error("Error updating lead priority:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { id } = req.params;
    console.log("Lead ID:", id);
    const lead = await Lead.findOne({
      where: { id, app_id: appId },
      include: [
        // Include any related models if needed
      ],
    });

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ==================== Lead FollowUp Controllers ====================
exports.saveLeadFollowUp = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    const username = req.user?.username;
    const empName = req.user?.name;

    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { lead_id, nextFollowUpTime, remark } = req.body;

    if (!lead_id || !nextFollowUpTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Create a new lead follow-up record
    const followUp = await LeadFollowUp.create({
      app_id: appId,
      lead_id,
      nextFollowUpTime,
      remark,
      empName,
      username,
    });

    // Update the `next_followup` field in the `Lead` table
    const lead = await Lead.update(
      { next_followup: nextFollowUpTime },
      { where: { id: lead_id } }
    );

    if (!lead[0]) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Lead follow-up saved and next follow-up updated successfully",
      data: followUp,
    });
  } catch (error) {
    console.error("Error saving lead follow-up:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getLeadFollowUps = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { leadId } = req.params;
    if (!leadId) {
      return res
        .status(400)
        .json({ success: false, message: "Lead ID is required" });
    }

    const followUps = await LeadFollowUp.findAll({
      where: { lead_id: leadId, app_id: appId },
      order: [["nextFollowUpTime", "DESC"]],
    });

    return res.status(200).json({ success: true, data: followUps });
  } catch (error) {
    console.error("Error fetching lead follow-ups:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ==================== Lead Interaction Controllers ====================
exports.saveLeadInteraction = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    const username = req.user?.username;
    const empName = req.user?.name;

    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { lead_id, interaction_type, interaction_date, notes, outcome } =
      req.body;

    if (!lead_id || !interaction_type || !interaction_date || !outcome) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create a new lead interaction record
    const interaction = await LeadInteraction.create({
      app_id: appId,
      lead_id,
      interaction_type,
      interaction_date,
      notes,
      outcome,
      username,
      empName,
    });

    // Update the `last_followup` field in the `Lead` table
    const lead = await Lead.update(
      { last_followup: interaction_date },
      { where: { id: lead_id } }
    );

    if (!lead[0]) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    return res.status(200).json({
      success: true,
      message:
        "Interaction logged successfully and lead's last follow-up updated",
      data: interaction,
    });
  } catch (error) {
    console.error("Error saving lead interaction:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getLeadInteractions = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { leadId } = req.params;
    if (!leadId) {
      return res
        .status(400)
        .json({ success: false, message: "Lead ID is required" });
    }

    const interactions = await LeadInteraction.findAll({
      where: { lead_id: leadId, app_id: appId },
      order: [["interaction_date", "DESC"]],
    });

    return res.status(200).json({ success: true, data: interactions });
  } catch (error) {
    console.error("Error fetching lead interactions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ==================== Lead Team Assignment Controllers ====================
exports.assignLeadTeamMember = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { lead_id, team_member_username, team_member_name, role } = req.body;

    if (!lead_id || !team_member_username || !team_member_name || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const assignment = await LeadTeamAssignment.create({
      app_id: appId,
      lead_id,
      team_member_username,
      team_member_name,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Team member assigned successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error assigning team member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getLeadTeamAssignments = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { leadId } = req.params;
    if (!leadId) {
      return res
        .status(400)
        .json({ success: false, message: "Lead ID is required" });
    }

    const assignments = await LeadTeamAssignment.findAll({
      where: { lead_id: leadId, app_id: appId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    console.error("Error fetching lead team assignments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.removeLeadTeamMember = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { assignmentId, leadId } = req.params;

    const assignment = await LeadTeamAssignment.findOne({
      where: { id: assignmentId, lead_id: leadId, app_id: appId },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Team assignment not found",
      });
    }

    await assignment.destroy();
    return res.status(200).json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.saveLeadQuotation = async (req, res) => {
  console.log(req.body);
  const t = await sequelize.transaction(); // Start transaction

  try {
    const appId = req.user?.app_id;
    const username = req.user?.username;

    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { lead_id, quotation_date, details, amount } = req.body;

    if (!lead_id || !quotation_date || !details || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const quotation = await LeadQuotation.create(
      {
        app_id: appId,
        lead_id,
        date: quotation_date,
        details,
        amount,
        status: "Not Accepted",
        sentBy: username,
      },
      { transaction: t }
    );

    await t.commit(); // Commit transaction

    return res.status(200).json({
      success: true,
      message: "Quotation saved successfully",
      data: quotation,
    });
  } catch (error) {
    await t.rollback(); // Rollback transaction on error
    console.error("Error saving quotation:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
exports.getLeadQuotations = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { leadId } = req.params;
    if (!leadId) {
      return res
        .status(400)
        .json({ success: false, message: "Lead ID is required" });
    }

    const quotations = await LeadQuotation.findAll({
      where: { lead_id: leadId, app_id: appId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: quotations });
  } catch (error) {
    console.error("Error fetching lead quotations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateQuotationStatus = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.params;
    const { status } = req.body;

    if (!["Accepted", "Not Accepted"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    await LeadQuotation.update({ status }, { where: { id } });
    res.json({
      success: true,
      message: "Quotation status updated successfully",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update status" });
  }
};

exports.getClientLeads = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { clientId } = req.params;
    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    const leads = await Lead.findAll({
      where: { client_id: clientId, app_id: appId },
      attributes: [
        "id",
        "event_type",
        "venue",
        "event_date",
        "lead_source",
        "lead_status",
        "priority",
        "next_followup",
        "createdBy",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: leads });
  } catch (error) {
    console.error("Error fetching client leads:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateClientFollowUpStatus = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { id } = req.params; // follow-up ID
    const { status } = req.body; // new status value

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Follow-up status is required" });
    }

    // Update the follow-up with the new status where follow-up id and app_id match
    const [updated] = await ClientFollowUp.update(
      { status },
      { where: { id, app_id: appId } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Follow-up status updated successfully",
    });
  } catch (error) {
    console.error("Error updating follow-up status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateLeadFollowUpStatus = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Please log in" });
    }

    const { followUpId } = req.params; // follow-up ID from the route parameter
    const { status } = req.body; // new status value

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Follow-up status is required" });
    }

    // Update the follow-up record where the id and app_id match
    const [updated] = await LeadFollowUp.update(
      { status },
      { where: { id: followUpId, app_id: appId } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Follow-up status updated successfully",
    });
  } catch (error) {
    console.error("Error updating follow-up status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.assignMarketingTeamMember = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in",
      });
    }

    const { employee_id, emp_name, emp_username, category, states, cities } = req.body;

    // Validate required fields
    if (!employee_id || !emp_name || !emp_username || !category) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, name, username, and category are required",
      });
    }

    // Check if employee already exists
    const existingEmployee = await MarketingTeam.findOne({
      where: { employee_id, app_id: appId },
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: `Employee with ID ${employee_id} is already assigned to the marketing team.`,
      });
    }

    // Save assignment if employee doesn't exist
    const assignment = await MarketingTeam.create({
      app_id: appId,
      employee_id,
      emp_name,
      emp_username,
      category,
      states,
      cities,
    });

    return res.status(200).json({
      success: true,
      message: "Marketing team member assigned successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error assigning marketing team member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


exports.getMarketingTeamMembers = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in",
      });
    }
    // Get all team members for the app in descending order of creation.
    const teamMembers = await MarketingTeam.findAll({
      where: { app_id: appId },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error("Error fetching marketing team members:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getSpecialMarketingDetails = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in",
      });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad Request: Employee ID is required",
      });
    }
    // Fetch special details for the specified employee within the same app.
    const specialDetails = await MarketingTeam.findOne({
      where: { app_id: appId, id },
    });
    if (!specialDetails) {
      return res.status(404).json({
        success: false,
        message: "Employee assignment details not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: specialDetails,
    });
  } catch (error) {
    console.error("Error fetching special marketing details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateMarketingTeamMember = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in",
      });
    }

    const { id } = req.params;
    const { emp_name, emp_username, category, states, cities } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        message: " ID is required",
      });
    }

    const employee = await MarketingTeam.findOne({
      where: { id, app_id: appId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found in the marketing team",
      });
    }

    // Update employee details
    await employee.update({ emp_name, emp_username, category, states, cities });

    return res.status(200).json({
      success: true,
      message: "Marketing team member updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Error updating marketing team member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};