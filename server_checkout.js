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

function generateSignature(clientId, requestId, requestTimestamp, requestTarget, digest, secret) {
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
    if (digest) {
        componentSignature += "\n";
        componentSignature += "Digest:" + digest;
    }
 
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

console.log("----- Digest -----");
let jsonBody = JSON.stringify({
    "order": {
        "amount": 90000,
        "invoice_number": "INV-12345"
    },
    "payment": {
        "payment_due_date": 60
    },
    "customer": {
        "id": "CUST-0001",
        "name": "Anton Budiman",
        "email": "anton@example.com",
        "phone": "6285694566147",
        "address": "Menara Mulia Lantai 8",
        "country": "ID"
    }
})
// console.log(jsonBody)
let digest = generateDigest(jsonBody);
console.log(digest);
console.log("JSON BODY:" + jsonBody);
console.log();

function randomInvoice(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var invoice = "INV-"+randomInvoice(10);
// console.log(invoice);
var clientId = 'BRN-0252-1648456322620';
var secret = 'SK-2zQLDKEZE8IzWWGT0BS8';
var url = 'https://api-sandbox.doku.com';
var requestTarget = '/checkout/v1/payment';
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
        digest, // Set empty string for this argumentes if HTTP Method is GET/DELETE
        secret)
console.log("----- Header Signature -----")
console.log(headerSignature)

var options = {
  'method': 'POST',
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
  body: jsonBody
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});