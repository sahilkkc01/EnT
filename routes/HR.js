var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { saveEmployeeData, getAllEmployees } = require('../controllers/HRctrl');
JWT_SECRET=process.env.JWT_SECRET

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/MyUploads"));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
    },
  });
  const upload = multer({ storage: storage });


router.get("/add-employee", function (req, res, next) {
  res.render("HR/add-employee");
});
router.get("/employees", function (req, res, next) {
  res.render("HR/employee-list");
});

router.post("/emp-reg", upload.single("empImage"), saveEmployeeData);
router.get("/get-employees", getAllEmployees);

module.exports = {router};
