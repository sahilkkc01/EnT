const { Employee } = require("../models/HrSchema.js")
const path = require("path");
const bcrypt = require("bcryptjs");


exports.saveEmployeeData = async (req, res) => {
    console.log(req.body);
    // console.log(req.file);
    // console.log(req.user)
    const appId = req.user?.app_id; // Get app_id from session

    // Check if appId is available (allow 0 but reject null or undefined)
    if (appId === null || appId === undefined) {
        return res.status(400).send({ msg: "Please login" });
    }
    try {
        const {
            name,
            username,
            password,
            dob,
            gender,
            phoneNumber,
            email,
            address,
            dept,
            desg,
            doj,
            qualification,
            exp,
            shiftTimming,
            emerCont,
            emerContMobile,
        } = req.body;

        // Validate required fields
        if (!username || !password || !name || !phoneNumber) {
            return res.status(400).json({ message: "UserName, password, name, and phone number are required." });
        }

        const existingEmployee = await Employee.findOne({
            where: { username, app_id: appId },
        });
        if (existingEmployee) {
            return res.status(400).json({ message: "An employee with this UserName already exists." });
        }

        const empImage = req.file ? path.basename(req.file.path) : null;

        // Convert empty date values to null
        const formattedDob = dob && dob.trim() !== "" ? dob : null;
        const formattedDoj = doj && doj.trim() !== "" ? doj : null;

        // Hash password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new employee record
        const newEmployee = await Employee.create({
            app_id: appId,
            username,
            password: hashedPassword, // Save hashed password
            name,
            dob: formattedDob,
            gender,
            phoneNumber,
            email,
            address,
            dept,
            desg,
            doj: formattedDoj,
            qualification,
            exp,
            shiftTimming,
            emerCont,
            emerContMobile,
            empImage,
        });

        return res.status(201).json({
            message: "Employee data saved successfully",
            employee: newEmployee,
        });
    } catch (error) {
        console.error("Error saving employee data:", error);
        return res.status(500).json({ message: "Failed to save employee data" });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
      const appId = req.user?.app_id; // Get app_id from logged-in user
  
      if (appId === undefined || appId === null) {
        return res.status(401).json({ message: "Unauthorized: Please log in" });
      }
  
      const employees = await Employee.findAll({
        where: { app_id: appId }, 
        order: [["createdAt", "DESC"]],
      });
  
      return res.status(200).json({ employees });
    } catch (error) {
      console.error("Error fetching employees:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  
