const { Department, UserTokens } = require("../models/EnT");
const { Employee } = require("../models/HrSchema");
// const md5 = require("md5");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET
const bcrypt = require("bcryptjs");


exports.login = async (req, res) => {
 
  const { username, password } = req.body;

  console.log(req.body);

  try {
    // Step 1: Verify user credentials
    const user = await Employee.findOne({
      where: {
        username: username,
        status: true,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Step 2: Compare hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // Step 3: Check if user is already logged in elsewhere
    const existingToken = await UserTokens.findOne({
      where: { username: user.username },
    });

    if (existingToken) {
      return res.status(409).json({
        msg: "User is already logged in elsewhere.",
        username: user.username,
      });
    }

    // Step 4: Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        app_id: user.app_id,
        username: user.username,
        name: user.name,
      },
      JWT_SECRET // Secret key stored in environment variable
    );

    // Step 5: Store token in HttpOnly cookie
    res.cookie("token", token, {
      maxAge: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months
      httpOnly: true, // Prevents client-side access
    });

    // Step 6: Save token in UserTokens table
    await UserTokens.create({
      username: user.username,
      jwtToken: token,
    });

    // Step 7: Send final login response
    // console.log(user);
    res.status(200).json({
      msg: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        app_id: user.app_id,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ msg: "Error during login" });
  }
};
exports.logoutFromEverywhere = async (req, res) => {
  console.log(req.body);
  try {
    const { username } = req.body;

    console.log(req.body);

    const user = await Employee.findOne({
      where: {
        username: username,
        status: true,
      },
    });

    await UserTokens.destroy({
      where: { username: user.username },
    });

    res.status(200).json({ msg: "Logout successful" });
  } catch (error) {}
};
exports.logout = async (req, res) => {
  const token = req.cookies.token; // Get token from HttpOnly cookie

  if (!token) {
    return res.status(400).json({ msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log(`Decoded token:`, decoded);

    // Find and delete the token from the UserTokens table (if applicable)
    // Uncomment if you are storing tokens in the database

    await UserTokens.destroy({
      where: { username: decoded.username, jwtToken: token },
    });

    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    console.log(`Token cleared for user: ${decoded.username}`);
    return res.status(200).json({ msg: "Logout successful" });
  } catch (err) {
    console.error("Error during logout:", err);
    return res.status(401).json({ msg: "Failed to authenticate token" });
  }
};



exports.addDepartment = async (req, res) => {
    console.log(req.body)
    const { dept } = req.body;
    const appId = req.user?.app_id; // Get app_id from session

    // Check if appId is available (allow 0 but reject null or undefined)
    if (appId === null || appId === undefined) {
      return res.status(400).send({ msg: "Please login" });
    }
  
    // Validate if specialty name is provided
    if (!dept) {
      return res.status(400).json({ message: "Department is required" });
    }
  
    try {
      // Check if the specialization already exists for the clinic
      const existingDepartment = await Department.findOne({
        where: { name: dept, app_id: appId },
      });
  
      if (existingDepartment) {
        return res
          .status(400)
          .json({ message: "Department already exists for this clinic" });
      }
  
      // Create new specialty if it doesn't exist
      const newDepartment = await Department.create({
        name: dept,
        app_id: appId,
      });
      res.status(200).json({
        message: "Department added successfully",
        dept: newDepartment,
      });
    } catch (error) {
      console.error("Error adding department:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  exports.getDataFromField = async (req, res) => {

    const { elementId } = req.query; 
    const appId = req.user?.app_id; // Get app_id from session

    // Check if appId is available (allow 0 but reject null or undefined)
    if (appId === null || appId === undefined) {
      return res.status(400).send({ msg: "Please login" });
    }

    if (!elementId) {
      return res.status(400).send({ msg: "Schema name is required" });
    }
  
    try {
   
      const model = require("../models/EnT")[elementId]; 
      if (!model) {
        return res.status(404).send({ msg: `Schema ${elementId} not found` });
      }
  
     
      const data = await model.findAll({
        where: {
          app_id: appId, 
        },
      });
      // console.log(data)
  
      res.status(200).json({ message: "Data fetched successfully", data });
    } catch (error) {
      console.error("Error fetching data from schema:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };