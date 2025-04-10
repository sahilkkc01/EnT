var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { assignSalesTeamMember, getSalesTeamMembers, getSpecialSalesDetails, updateSalesTeamMember } = require('../controllers/SalesCtrl');

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


router.get("/assignteam", function (req, res, next) {
  res.render("Sales/SalesTeam");
});
router.get("/team", function (req, res, next) {
  res.render("Sales/SalesTeamList");
});

router.post('/assign-employee',assignSalesTeamMember)
router.get('/team-members',getSalesTeamMembers)
router.get('/get-assignment/:id',getSpecialSalesDetails)
router.put('/update-assignment/:id',updateSalesTeamMember)


module.exports = {router};
