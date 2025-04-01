var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path')
const { addDepartment, login, logoutFromEverywhere, getDataFromField, logout, addTransportType, addVendorType, addCompany, getAllCompanies, getCompanyById } = require('../controllers/EnTctrl');
const { UserTokens } = require('../models/EnT');
JWT_SECRET=process.env.JWT_SECRET

/* GET users listing. */
router.get("/", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.render("login");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserTokens.findOne({ where: { jwtToken: token } });

    if (!user) {
      return res.render("login");
    }

    return res.redirect("/HR/employees");
  } catch (err) {
    console.error("Invalid token", err);
    return res.render("login");
  }
});

router.get('/company-reg',(req,res)=>{
  res.render('Master/Company-reg')
})
router.get('/companies',(req,res)=>{
  res.render('Master/Company-list')
})



router.post("/login", login);
router.post("/logout", logout);
router.post("/logoutFromEverywhere", logoutFromEverywhere);


router.get("/getDataFromField", getDataFromField);
router.post("/addDept", addDepartment);
router.post("/addVendorType", addVendorType);
router.get('/getStates', (req, res) => {
  fs.readFile(path.join(__dirname, '../public/json', 'State.json'), 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading the file');
      return;
    }
    res.send(data);
    
  });
});
router.get('/cities', (req, res) => {
  fs.readFile(path.join(__dirname, '../public/json', 'City.json'), 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading the file');
      return;
    }
    res.json(JSON.parse(data));
  });
});

router.post('/saveCompany',addCompany)
router.get('/get-companies',getAllCompanies)
router.get('/getCompanyDetails/:id',getCompanyById)
module.exports = {router};
