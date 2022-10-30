"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_1 = require("../controller/payment");
const router = (0, express_1.Router)();
router.post('/', payment_1.cardPayment);
router.get('/payments', payment_1.payments);
router.get('/:id', (req, res) => {
    res.send("Hellooooo");
});
exports.default = router;
