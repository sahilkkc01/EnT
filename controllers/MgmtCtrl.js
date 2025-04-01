const path = require('path')
const { Hotel, Vendor } = require("../models/MgmtSchema");

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
                hotelName,
                state, 
                city 
            } 
        });
        if (existingHotel) {
            return res.status(400).json({ message: "A hotel with same name already exists in this city and state." });
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

exports.updateHotelData = async (req, res) => {
    console.log(req.body);
    const appId = req.user?.app_id; // Get app_id from session

    // Check if appId is available (allow 0 but reject null or undefined)
    if (appId === null || appId === undefined) {
        return res.status(400).send({ msg: "Please login" });
    }

    try {
        const { hotelId } = req.params;

        // Check if the hotel exists and belongs to the user
        const hotel = await Hotel.findOne({ 
            where: { id: hotelId, app_id: appId } 
        });

        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

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

        // Convert JSON strings to objects if needed
        const parsedRoomTypes = roomTypes ? JSON.parse(roomTypes) : [];
        const parsedContacts = contacts ? JSON.parse(contacts) : [];

        // Handle image upload
        const hotelImage = req.file ? path.basename(req.file.path) : hotel.hotelImage;

        // Update hotel record
        await hotel.update({
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
        });

        return res.status(200).json({
            message: "Hotel data updated successfully",
            hotel,
        });
    } catch (error) {
        console.error("Error updating hotel data:", error);
        return res.status(500).json({ message: "Failed to update hotel data" });
    }
};

exports.getAllHotels = async (req, res) => {
    try {
        const appId = req.user?.app_id;
        if (!appId) {
            return res.status(401).json({ message: "Unauthorized: Please log in" });
        }

        let { page = 1, limit = 50 } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.max(10, parseInt(limit)); // Minimum 10 records per page

        const offset = (page - 1) * limit;

        // Fetch paginated hotels
        const { rows: hotels, count: totalHotels } = await Hotel.findAndCountAll({
            where: { app_id: appId },
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        return res.status(200).json({ hotels, totalHotels, totalPages: Math.ceil(totalHotels / limit) });
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getHotelById = async (req, res) => {
    try {
        const appId = req.user?.app_id;
        if (!appId) {
            return res.status(401).json({ message: "Unauthorized: Please log in" });
        }

        const { hotelId } = req.params;

        const hotel = await Hotel.findOne({
            where: { id: hotelId, app_id: appId },
        });

        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        return res.status(200).json(hotel);
    } catch (error) {
        console.error("Error fetching hotel details:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.saveOrUpdateVendor = async (req, res) => {
    console.log(req.body);
    try {
        const appId = req.user?.app_id;
        if (!appId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Please log in" });
        }

        const {
            id, vendorName, contactPerson, phoneNumber, email, state, city, vendorType, vendorRating, 
            vendorPortfolio, vendorStatus, vendorNotes, nationalService, accNumber, accType, gstNumber, 
            contacts, services
        } = req.body;

        if (!vendorName || !contactPerson || !phoneNumber) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Ensure `contacts` and `services` are properly formatted
        let formattedContacts = Array.isArray(contacts) ? contacts : [];
        let formattedServices = Array.isArray(services) ? services : [];

        // Ensure `vendorRating` is within the valid range
        let rating = vendorRating;
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ success: false, message: "Vendor rating must be between 1 and 5" });
        }

        // Check for duplicate vendor only if it's a new entry
        if (!id) {
            const existingVendor = await Vendor.findOne({
                where: { vendorName, state, city, phoneNumber, app_id: appId }
            });

            if (existingVendor) {
                return res.status(400).json({ success: false, message: "Vendor with the same details already exists within this app" });
            }
        }

        const vendorData = {
            app_id: appId,
            vendorName,
            contactPerson,
            phoneNumber,
            email,
            state,
            city,
            vendorType,
            contacts: formattedContacts,
            services: formattedServices,
            vendorRating: rating,
            vendorPortfolio,
            vendorStatus,
            vendorNotes,
            nationalService,
            accNumber,
            accType,
            gstNumber
        };

        if (id) {
            const [updated] = await Vendor.update(vendorData, { where: { id, app_id: appId } });
            if (!updated) {
                return res.status(404).json({ success: false, message: "Vendor not found or unauthorized" });
            }
        } else {
            await Vendor.create(vendorData);
        }

        return res.status(200).json({ success: true, message: id ? "Vendor updated successfully" : "Vendor created successfully" });
    } catch (error) {
        console.error("Error saving/updating vendor:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


// Get Vendor by ID
exports.getVendorById = async (req, res) => {
    try {
        const appId = req.user?.app_id;
        if (!appId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Please log in" });
        }

        const { id } = req.params;
        const vendor = await Vendor.findOne({ where: { id, app_id: appId } });

        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

    

        return res.status(200).json({ success: true, data: vendor });

    } catch (error) {
        console.error("Error fetching vendor:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


// Get All Vendors (Paginated)
exports.getAllVendors = async (req, res) => {
    try {
        const appId = req.user?.app_id;
        if (!appId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Please log in" });
        }

        let { page = 1, limit = 50 } = req.query;
        page = Math.max(1, Number(page) || 1);
        limit = Math.max(10, Number(limit) || 50); // Minimum 10 records per page

        const offset = (page - 1) * limit;

        // Fetch paginated vendors
        const { rows: vendors, count: totalVendors } = await Vendor.findAndCountAll({
            where: { app_id: appId },
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        if (!vendors.length) {
            return res.status(404).json({ success: false, message: "No vendors found" });
        }

        return res.status(200).json({
            success: true,
            vendors,
            totalVendors,
            totalPages: Math.ceil(totalVendors / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

