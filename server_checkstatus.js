var request = require('request');
var crypto = require('crypto');
var {
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');

function generateDigest(jsonBody) {
    let jsonStringHash256 = crypto.createHash('sha256').update(jsonBody,"utf-8").digest();
    
    let bufferFromJsonStringHash256 = Buffer.from(jsonStringHash256);
    return bufferFromJsonStringHash256.toString('base64'); 
}

function generateSignature(clientId, requestId, requestTimestamp, requestTarget, secret) {
    // Prepare Signature Component
    console.log("----- Component Signature -----")
    let componentSignature = "Client-Id:" + clientId;
    componentSignature += "\n";
    componentSignature += "Request-Id:" + requestId;
    componentSignature += "\n";
    componentSignature += "Request-Timestamp:" + requestTimestamp;
    componentSignature += "\n";
    componentSignature += "Request-Target:" + requestTarget;
    // If body not send when access API with HTTP method GET/DELETE
    // if (digest) {
    //     componentSignature += "\n";
    //     componentSignature += "Digest:" + digest;
    // }
 
    console.log(componentSignature.toString());
    console.log();

    // Calculate HMAC-SHA256 base64 from all the components above
    let hmac256Value = crypto.createHmac('sha256', secret)
                   .update(componentSignature.toString())
                   .digest();  
      
    let bufferFromHmac256Value = Buffer.from(hmac256Value);
    let signature = bufferFromHmac256Value.toString('base64');
    // Prepend encoded result with algorithm info HMACSHA256=
    return "HMACSHA256="+signature 
}

// console.log("----- Digest -----");
// let jsonBody = JSON.stringify({ 
//     "order": {
//         "invoice_number":"INV-100001",
//         "line_items": [
//             {
//             "name": "DOKU T-Shirt Merah",
//             "price": 20000,
//             "quantity": 1
//             }
//         ],
//         "amount": 20000,
//         "callback_url": "https://doku.com",
//         "auto_redirect": false
//     },
//     "card": {
//         "save": true
//     },
//     "customer": {
//         "id": "CUST-0004",
//         "name":"Budi",
//         "email":"Tono@mail.com",
//         "phone":"+6281287458232",
//         "address":"Jakarta, Menara Mulia Lt 8",
//         "country":"ID",
//         "postcode":"11480"
//     }
// })
// let digest = generateDigest(jsonBody);
// console.log(digest);
// console.log();
var Invoice = 'INV-1640073882'
var clientId = 'BRN-0252-1648456322620';
var secret = 'SK-2zQLDKEZE8IzWWGT0BS8';
var url = 'https://api-sandbox.doku.com';
var requestTarget = '/orders/v1/status/'+Invoice;
var requestId = uuidv1();
// var invoice = 
let RequestTimestamp  = new Date().toISOString().slice(0, 19) + "Z";
// console.log(RequestTimestamp);
// Generate Header Signature
let headerSignature = generateSignature(
        clientId,
        requestId,
        RequestTimestamp,
        requestTarget, // For merchant request to Jokul, use Jokul path here. For HTTP Notification, use merchant path here
        // digest, // Set empty string for this argumentes if HTTP Method is GET/DELETE
        secret)
console.log("----- Header Signature -----")
console.log(headerSignature)

var options = {
  'method': 'GET',
  'url': url + requestTarget,
  'headers': {
    'Client-Id': clientId,
    'Request-Id': requestId,
    'Request-Timestamp': RequestTimestamp,
    'Signature': headerSignature,
    'Content-Type': 'application/json'
  },
  rejectUnauthorized: false,//add when working with https sites
    requestCert: false,//add when working with https sites
    agent: false,//add when working with https sites
  // body: jsonBody
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
