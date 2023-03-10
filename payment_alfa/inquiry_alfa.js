const crypto = require("crypto");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const port = 8080;
const host = 'localhost';

app.use(bodyParser.json());

app.post('/doku/inquiry/payment_alfa', (req, res) => {
    var requestHeader = req.headers;
    console.log(req.body);

    const data = {
        "order": {
            "invoice_number": "INV-" + Date.now(+7),
            "amount": 15000
        },
        "online_to_offline_info": {
            "payment_code": req.body["online_to_offline_info"]["payment_code"],
            "info1": "Online Shoping Store"
        },
        "online_to_offline_inquiry": {
            "status": "success"
        },
        "customer": {
            "name": "Integrasi Zhahir",
            "email": "integrasi@doku.com"
        }
    }
    function generateDigest(jsonBody) {
        let jsonStringHash256 = crypto
          .createHash("sha256")
          .update(jsonBody, "utf-8")
          .digest();
    
        let bufferFromJsonStringHash256 = Buffer.from(jsonStringHash256);
        return bufferFromJsonStringHash256.toString("base64");
      }
    
    function generateSignature(clientId, requestId, requestTimestamp, requestTarget, digest, secret) {
            // Prepare Signature Component
            console.log("----- Component Signature -----")
            let componentSignature = "Client-Id:" + clientId;
            componentSignature += "\n";
            componentSignature += "Request-Id:" + requestId;
            componentSignature += "\n";
            componentSignature += "Response-Timestamp:" + requestTimestamp;
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
    
    
    // const date  = new Date().toISOString().slice(0, 19) + "Z";
    const datadigest = JSON.stringify(data);
    const requestTarget = "/doku/inquiry/payment_alfa";
    const digiest = generateDigest(datadigest);
    const secret = "SK-2zQLDKEZE8IzWWGT0BS8";
    const signatureFunction = generateSignature(
        requestHeader["client-id"],
        requestHeader["request-id"],
        requestHeader["request-timestamp"],
        requestTarget,
        digiest,
        secret
      );
    
    // Response Header
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Client-Id", requestHeader["client-id"]);
    res.setHeader("Request-Id", requestHeader["request-id"]);
    res.setHeader("Response-Timestamp", requestHeader["request-timestamp"]);
    res.setHeader("Signature", signatureFunction);
    res.json(data);
    // res.end(JSON.stringify(data, null, 3));
});

app.listen(port, host, () => {
console.log(`Server is running on http://${host}:${port}`);
});