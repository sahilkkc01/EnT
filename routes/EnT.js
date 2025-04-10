var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path')
const multer = require("multer");
const { addDepartment, login, logoutFromEverywhere, getDataFromField, logout, addTransportType, addVendorType, addCompany, getAllCompanies, getCompanyById, uploadFile, getFiles, downloadFile, updateFileStatus, getEmployeePermissions, updateEmployeePermissions } = require('../controllers/EnTctrl');
const { UserTokens } = require('../models/EnT');
JWT_SECRET=process.env.JWT_SECRET
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/Documents"));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
    },
  });
  const upload = multer({ storage: storage });


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

    return res.redirect("/marketing/clients");
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
router.get('/uploadfiles',(req,res)=>{
  res.render('Admin/UploadFile')
})
router.get('/userPermissions',(req,res)=>{
  res.render('Admin/Permission')
})

router.post("/login", login);
router.post("/logout", logout);
router.post("/logoutFromEverywhere", logoutFromEverywhere);

router.post('/files/upload', upload.single('file'), uploadFile);
router.get('/files/get', getFiles);
router.get('/files/download', downloadFile);
router.patch('/files/update-status', updateFileStatus);

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

router.get('/admin/employee-permissions/:emp_id', getEmployeePermissions);
router.post('/admin/update-permissions', updateEmployeePermissions);
module.exports = {router};
