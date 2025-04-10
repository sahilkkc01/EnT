const { SalesTeam } = require("../models/SalesSchema");

exports.assignSalesTeamMember = async (req, res) => {
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
    const existingEmployee = await SalesTeam.findOne({
      where: { employee_id, app_id: appId },
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: `Employee with ID ${employee_id} is already assigned to the Sales Team.`,
      });
    }

    // Save assignment if employee doesn't exist
    const assignment = await SalesTeam.create({
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
      message: "Sales Team member assigned successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error assigning Sales Team member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


exports.getSalesTeamMembers = async (req, res) => {
  try {
    const appId = req.user?.app_id;
    if (!appId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in",
      });
    }
    // Get all team members for the app in descending order of creation.
    const teamMembers = await SalesTeam.findAll({
      where: { app_id: appId },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error("Error fetching Sales Team members:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getSpecialSalesDetails = async (req, res) => {
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
    const specialDetails = await SalesTeam.findOne({
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

exports.updateSalesTeamMember = async (req, res) => {
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

    const employee = await SalesTeam.findOne({
      where: { id, app_id: appId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found in the Sales Team",
      });
    }

    // Update employee details
    await employee.update({ emp_name, emp_username, category, states, cities });

    return res.status(200).json({
      success: true,
      message: "Sales Team member updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Error updating Sales Team member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};