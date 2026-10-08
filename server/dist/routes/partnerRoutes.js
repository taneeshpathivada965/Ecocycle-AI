"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const partnerController_1 = require("../controllers/partnerController");
const router = (0, express_1.Router)();
router.get('/', partnerController_1.PartnerController.getPartners);
router.get('/nearby', partnerController_1.PartnerController.getNearbyPartners);
exports.default = router;
