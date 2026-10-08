"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const demoController_1 = require("../controllers/demoController");
const router = (0, express_1.Router)();
router.get('/scenarios', demoController_1.DemoController.seedScenarios);
router.post('/scenario/:scenarioId', demoController_1.DemoController.loadScenario);
exports.default = router;
