const path = require('path')
const { Hotel } = require("../models/MgmtSchema");

exports.saveHotelData = async (req, res) => {
    console.log(req.body);
    const appId = req.user?.app_id; // Get app_id from session

    // Check if appId is available (allow 0 but reject null or undefined)
    if (appId === null || appId === undefined) {
        return res.status(400).send({ msg: "Please login" });
    }

    try {
        const {
            hotelName,
            state,
            city,
            location,
            starCategory,
            totalRooms,
            eventVenue,
            usp,
            roomTypes,
            contacts,
        } = req.body;

        // Validate required fields
        if (!hotelName || !state || !city || !location || !totalRooms) {
            return res.status(400).json({ message: "Hotel name, state, city, location, and total rooms are required." });
        }

        const existingHotel = await Hotel.findOne({ 
            where: { 
                app_id: appId, 
                state, 
                city 
            } 
        });
        if (existingHotel) {
            return res.status(400).json({ message: "A hotel already exists in this city and state." });
        }

        // Convert JSON strings to objects if needed
        const parsedRoomTypes = roomTypes ? JSON.parse(roomTypes) : [];
        const parsedContacts = contacts ? JSON.parse(contacts) : [];

        // Handle image upload
        const hotelImage = req.file ? path.basename(req.file.path) : null;

        // Save hotel record
        const newHotel = await Hotel.create({
            app_id: appId,
            hotelName,
            state,
            city,
            location,
            starCategory,
            totalRooms,
            eventVenue,
            usp,
            roomTypes: parsedRoomTypes, // Sequelize JSON type
            contacts: parsedContacts, // Sequelize JSON type
            hotelImage,
            status: true, // Default status
        });

        return res.status(201).json({
            message: "Hotel data saved successfully",
            hotel: newHotel,
        });
    } catch (error) {
        console.error("Error saving hotel data:", error);
        return res.status(500).json({ message: "Failed to save hotel data" });
    }
};

exports.getAllHotels = async (req, res) => {
    try {
        const appId = req.user?.app_id; // Get app_id from logged-in user

        if (appId === undefined || appId === null) {
            return res.status(401).json({ message: "Unauthorized: Please log in" });
        }

        const hotels = await Hotel.findAll({
            where: { app_id: appId }, 
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({ hotels });
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
