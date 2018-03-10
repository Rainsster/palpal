const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ASVdcCPhPQ1YCgYdFjnm0nZg0JEfDqV3glGwr5M37KMeyNmTc9W-hWia_gTKENghXnVSKFQos5SytSH7',
  'client_secret': 'EHEjBiI-vUCoW4bnzYauwnHpP6MGE_6jYc5x7gg5GeArfkPjqNk0vLe2k69lHXngWlfox1XdgXzAgri8'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));
const amount = 25;
const price = amount*.07
var cost = price.toFixed(2)
console.log(cost);
app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "QB Lives",
                "sku": "001",
                "price": ".07",
                "currency": "USD",
                "quantity": amount
            }]
        },
        "amount": {
            "currency": "USD",
            "total": cost
        },
        "description": "Hat for the best team ever"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
		  console.log(payment.links[i].href);
        }
      }
  }
});

});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": cost
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('Server Started'));