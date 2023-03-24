const crypto = require("crypto");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var {
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');
const fs = require('fs');

const port = 8080;
const host = 'localhost';

//parsing body json from request
app.use(bodyParser.json());

// get body request and set response 
app.post('/doku/notify', (req, res) => {
    var requestHeader = req.headers;
    const body = req.body
    console.log(body);

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
// set body beautify 
const datadigest = JSON.stringify(body, null, 2);
// set body minify
// const datadigest = JSON.stringify(body);
const digiest = generateDigest(datadigest);
console.log(digiest);
const secret = 'SK-2zQLDKEZE8IzWWGT0BS8';
const requestTarget = '/doku/notify';
const headerSignature = generateSignature(
        requestHeader["client-id"],
        requestHeader["request-id"],
        requestHeader["request-timestamp"],
        requestTarget,
        digiest,
        secret
        );
console.log("----- Header Signature -----")
console.log(headerSignature)

// Response Header
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Client-Id", requestHeader["client-id"]);
    res.setHeader("Request-Id", requestHeader["request-id"]);
    res.setHeader("Request-Timestamp", requestHeader["request-timestamp"]);
    res.setHeader("Signature", headerSignature);
    res.json(body);

// Condition Signature

// const filepath = '/doku/notify/signature.txt';
let successlog = datadigest;
    successlog += "\n";
    successlog += "Signature Generated: " + headerSignature;
    successlog += "\n";
    successlog += "Signature DOKU: " + requestHeader['signature'];
    successlog += "\n";
    successlog += "Berhasil";
let failedlog = datadigest;
    failedlog += "\n";
    failedlog = "Signature Generated: " + headerSignature;
    failedlog += "\n";
    failedlog += "Signature DOKU: " + requestHeader['signature'];
    failedlog += "\n";
    failedlog += "Gagal";

if (headerSignature == requestHeader['signature']){
    fs.writeFile('signature.txt', successlog, (err) => {
        if (err) throw err;
    console.log('The file has been created and saved!');
  });
} else {
    fs.writeFile('signature.txt', failedlog, (err) => {
        if (err) throw err;
    console.log('The file has been created and saved!');
    });
};

});

// start app
app.listen(port, host, () => {
console.log(`Server is running on http://${host}:${port}`);
});