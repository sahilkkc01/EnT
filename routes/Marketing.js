var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const {  saveOrUpdateClient, getAllClients, updateClientStatus, updateClientPriority, getClientById, checkClient, getClientFollowUps, saveClientFollowUp, saveClientInteraction, getClientInteractions, getAllTeamMembers, assignClientTeamMember, getClientTeamAssignments, removeClientTeamMember, uploadClientDocument, getClientDocuments, getAllLeads, updateLeadStatus, updateLeadPriority, getLeadById, getLeadQuotations, createQuotation, saveLeadFollowUp, getLeadFollowUps, saveLeadInteraction, getLeadInteractions, assignLeadTeamMember, getLeadTeamAssignments, removeLeadTeamMember, saveLeadQuotation, updateQuotationStatus, getClientLeads, updateClientFollowUpStatus, updateLeadFollowUpStatus, assignMarketingTeamMember, getMarketingTeamMembers, getSpecialMarketingDetails, updateMarketingTeamMember } = require('../controllers/MarketingCtrl');
const { LeadFollowUp } = require('../models/MarketingSchema');
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


router.get("/clients", function (req, res, next) {
  res.render("Marketing/client-list");
});
router.get("/add-client", function (req, res, next) {
  res.render("Marketing/add-client");
});
router.get("/track-client", function (req, res, next) {
  res.render("Marketing/client-tracking");
});
router.get("/leads", function (req, res, next) {
  res.render("Marketing/lead-list");
});
router.get("/track-lead", function (req, res, next) {
  res.render("Marketing/lead-tracking");
});
router.get("/generate-invoice", function (req, res, next) {
  res.render("Marketing/Invoice-gen");
});
router.get("/team", function (req, res, next) {
  res.render("Marketing/MarketingTeamList");
});
router.get("/assignteam", function (req, res, next) {
  res.render("Marketing/MarketingTeam");
});

router.post('/saveClient',saveOrUpdateClient)
router.get('/get-clients',getAllClients)
router.put('/update-client-status/:id',updateClientStatus)
router.put('/update-client-priority/:id',updateClientPriority)
router.get('/getClientDetails/:id',getClientById)
router.post('/check-client',checkClient)
router.post("/client-followup",  saveClientFollowUp);
router.post("/client-interactions",  saveClientInteraction);
router.get("/client-followups/:clientId", getClientFollowUps);
router.get("/client-interactions/:clientId", getClientInteractions);
router.get("/teamMembers", getAllTeamMembers);
router.post("/client-team", assignClientTeamMember);
router.get("/client-team/:clientId", getClientTeamAssignments);
router.delete('/client-team/:clientId/team/:assignmentId',removeClientTeamMember);
router.post("/client-documents",upload.single("document") ,uploadClientDocument);
router.get("/client-documents/:clientId", getClientDocuments);
router.get("/getAllLeads", getAllLeads);
router.put('/update-lead-status/:id', updateLeadStatus);
router.put('/update-lead-priority/:id', updateLeadPriority);
router.get('/leads/:id', getLeadById);
router.post("/lead-followup",  saveLeadFollowUp);
router.get("/lead-followups/:leadId",  getLeadFollowUps);
router.post("/lead-interactions",saveLeadInteraction)
router.get("/lead-interactions/:leadId", getLeadInteractions);
router.post("/lead-team",assignLeadTeamMember)
router.get("/lead-team/:leadId",getLeadTeamAssignments)
router.delete('/lead-team/:leadId/team/:assignmentId',removeLeadTeamMember);
router.post('/quotations',saveLeadQuotation)
router.get("/quotations/:leadId",getLeadQuotations)
router.get("/client_leads/:clientId",getClientLeads)
router.put("/quotations/:id", updateQuotationStatus);
router.put("/update-client-followup-status/:id", updateClientFollowUpStatus);
router.put("/update-lead-followup-status/:followUpId", updateLeadFollowUpStatus);

router.post('/assign-employee',assignMarketingTeamMember)
router.get('/team-members',getMarketingTeamMembers)
router.get('/get-assignment/:id',getSpecialMarketingDetails)
router.put('/update-assignment/:id',updateMarketingTeamMember)
module.exports = {router};
