<?php
$clientId = "BRN-0252-1648456322620";
$requestId = "18436";
$requestTimestamp = "2023-01-19T07:50:53Z";
$targetPath = "/doku/inquiry/payment_bri"; 
$secretKey = "SK-2zQLDKEZE8IzWWGT0BS8";

$data = array (
        'order' => array (
            'invoice_number' => 'INV-'.rand(1,10000),
            'amount' => 20000,
            ),
        'virtual_account_info' => array (
            'virtual_account_number' => '12362704611001',
            'info1' => 'Payment ke 1',
            ),
        'virtual_account_inquiry' => array (
            'status' => 'success'
            ),
        'customer' => array (
            'name' => 'iyu priatna',
            'email' => 'iyu@lingkar9.com',
            ),
        'additional_info' => []
        );

// $requestBody = [
//         "order"=>[
//             "invoice_number"=>"INV-060123002-1",
//             "min_amount"=>25000,
//             "max_amount"=>500000
//         ],
//         "virtual_account_info"=>[
//             "virtual_account_number"=>"1236170141100",
//             "billing_type"=>"NO_BILL",
//             "info1"=>"Payment ke 1"
//         ],
//         "virtual_account_inquiry"=>[
//             "status"=>"success"
//         ],
//         "customer"=>[
//             "name"=>"iyu priatna",
//             "email"=>"iyu@lingkar9.com"
//         ],
//         "additional_info"=>[]
//     ];

echo "==== Request Body ==="."\n";
echo json_encode($data)."\n";
// Generate Digest
$digestValue = base64_encode(hash('sha256', json_encode($data), true));
echo "Digest: " . $digestValue;
echo "<br>\r\n\n";

// Prepare Signature Component
$componentSignature = "Client-Id:" . $clientId . "\n" . 
                      "Request-Id:" . $requestId . "\n" .
                      "Response-Timestamp:" . $requestTimestamp . "\n" . 
                      "Request-Target:" . $targetPath . "\n" .
                      "Digest:" . $digestValue;
echo "Component Signature: \n" . $componentSignature;
echo "<br>\r\n\n";
 
// Calculate HMAC-SHA256 base64 from all the components above
$signature = base64_encode(hash_hmac('sha256', $componentSignature, $secretKey, true));
echo "Signature: " . $signature;
echo "<br>\r\n\n";

// Sample of Usage
$headerSignature =  "Client-Id:" . $clientId ."\n". 
                    "Request-Id:" . $requestId . "\n".
                    "Response-Timestamp:" . $requestTimestamp ."\n".
                    // Prepend encoded result with algorithm info HMACSHA256=
                    "Signature:" . "HMACSHA256=" . $signature;
echo "your header request look like: \n".$headerSignature;
echo "\r\n\n";