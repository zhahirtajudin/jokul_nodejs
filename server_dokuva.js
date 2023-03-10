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
        "invoice_number": "INV-202208310957",
        "amount": 1500
    },
    "virtual_account_info": {
        "billing_type": "FIX_BILL",
        "expired_time": 720,
        "reusable_status": false,
        "info1": "dLocal Test Transaction"
    },
    "customer": {
        "name": "Test Customer",
        "email": "test@dlocaltest.com"
    }
})
let digest = generateDigest(jsonBody);
console.log(digest);
console.log();

var clientId = 'BRN-0252-1648456322620';
var secret = 'SK-2zQLDKEZE8IzWWGT0BS8';
var url = 'https://api-sandbox.doku.com';
var requestTarget = '/doku-virtual-account/v2/payment-code';
var requestId = 202208310957;
// var requestId = uuidv1();
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
  body: jsonBody
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
