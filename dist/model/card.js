"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Card {
    constructor(cvv, pin, pan, cardHolderName, cardExpireDate) {
        this.cvv = cvv;
        this.pin = pin;
        this.pan = pan;
        this.cardHolderName = cardHolderName;
        this.cardExpireDate = cardExpireDate;
    }
}
exports.default = Card;
