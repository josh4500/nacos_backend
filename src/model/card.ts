class Card{
    cvv : String;
    pin : String;
    pan : String;
    cardExpireDate : String;
    cardHolderName : String;

    constructor(cvv:string,pin:string,pan:string,cardHolderName:string,cardExpireDate:string) { 
        this.cvv = cvv 
        this.pin = pin 
        this.pan = pan 
        this.cardHolderName = cardHolderName
        this.cardExpireDate = cardExpireDate

    }  
}

export default Card;
