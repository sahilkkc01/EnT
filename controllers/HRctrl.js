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

exports.updateEmployeeData = async (req, res) => {
    console.log(req.body);
    
    const appId = req.user?.app_id; // Get app_id from session

    if (appId === null || appId === undefined) {
        return res.status(400).send({ msg: "Please login" });
    }

    const empId = req.params.id; // Employee ID from URL

    try {
        const existingEmployee = await Employee.findOne({
            where: { id: empId, app_id: appId },
        });

        if (!existingEmployee) {
            return res.status(404).json({ message: "Employee not found" });
        }

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

        // Hash password only if it is provided and different
        let hashedPassword = existingEmployee.password;
        if (password && password !== existingEmployee.password) {
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        // Convert empty date values to null
        const formattedDob = dob && dob.trim() !== "" ? dob : null;
        const formattedDoj = doj && doj.trim() !== "" ? doj : null;

        // Handle new image upload
        const empImage = req.file ? path.basename(req.file.path) : existingEmployee.empImage;

        // Update employee record
        await Employee.update(
            {
                username,
                password: hashedPassword,
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
            },
            { where: { id: empId, app_id: appId } }
        );

        return res.status(200).json({ message: "Employee data updated successfully" });
    } catch (error) {
        console.error("Error updating employee data:", error);
        return res.status(500).json({ message: "Failed to update employee data" });
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

exports.getEmployeeDetails = async (req, res) => {
    try {
        const appId = req.user?.app_id; // Get app_id from logged-in user
        const empId = req.params.id; // Get employee ID from request parameters

        if (!appId) {
            return res.status(401).json({ message: "Unauthorized: Please log in" });
        }

        if (!empId) {
            return res.status(400).json({ message: "Employee ID is required" });
        }

        const employee = await Employee.findOne({
            where: { id: empId, app_id: appId },
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        return res.status(200).json({ employee });
    } catch (error) {
        console.error("Error fetching employee details:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

  
