var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { saveHotelData, getAllHotels, getHotelById, updateHotelData, saveOrUpdateVendor, getVendorById, getAllVendors } = require('../controllers/MgmtCtrl');

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


router.get("/add-hotel", function (req, res, next) {
  res.render("MGMT/add-hotel");
});

router.get("/hotels", function (req, res, next) {
  res.render("MGMT/hotel-list");
});
router.get("/add-vendor", function (req, res, next) {
  res.render("MGMT/add-vendor");
});
router.get("/vendors", function (req, res, next) {
  res.render("MGMT/vendor-list");
});


router.post("/hotelReg", upload.single("hotelImage"),saveHotelData);
router.put("/hotelReg/:hotelId",upload.single("hotelImage"), updateHotelData);

router.get("/get-hotels", getAllHotels);
router.get("/hotels/:hotelId", getHotelById);

router.post('/vendorReg', saveOrUpdateVendor);
router.get('/vendor-details/:id', getVendorById);
router.get('/get-vendors',getAllVendors)


module.exports = {router};
