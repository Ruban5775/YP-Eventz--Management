<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Headers: Content-Type");

header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$cloud = require "../cloudinary.php";

$cloudinary = $cloud["client"];

$config = $cloud["config"];

/*
|--------------------------------------------------------------------------
| Read Request
|--------------------------------------------------------------------------
*/

$data = json_decode(file_get_contents("php://input"), true);

$folder = trim($data["folder"] ?? "");

if ($folder === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Folder is required."
    ]);

    exit;

}


/*
|--------------------------------------------------------------------------
| Get Cloudinary Credentials
|--------------------------------------------------------------------------
*/

$cloudName = $config["cloud_name"];
$apiKey = $config["api_key"];
$apiSecret = $config["api_secret"];


/*
|--------------------------------------------------------------------------
| Generate Signature
|--------------------------------------------------------------------------
*/

$timestamp = time();

$params = [
    "folder" => $folder,
    "timestamp" => $timestamp
];

ksort($params);

$toSign = [];

foreach ($params as $key => $value) {
    $toSign[] = $key . "=" . $value;
}

$stringToSign = implode("&", $toSign);

$signature = sha1($stringToSign . $apiSecret);

/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "cloud_name" => $cloudName,

    "api_key" => $apiKey,

    "timestamp" => $timestamp,

    "signature" => $signature,

    "folder" => $folder

]);


