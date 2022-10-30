
import Card from "./card"

class PaymentRequest{
    amount : Number
    card : Card;
    constructor(amount:Number,card : Card){
        this.amount = amount
        this.card = card
    }
}


export default PaymentRequest