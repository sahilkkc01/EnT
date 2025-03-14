var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { saveHotelData, getAllHotels } = require('../controllers/MgmtCtrl');

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


router.post("/hotelReg", upload.single("hotelImage"),saveHotelData);
router.get("/get-hotels", getAllHotels);

module.exports = {router};
