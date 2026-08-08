<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$config = require "../config.php";

$conn = new mysqli(
    $config["db_host"],
    $config["db_user"],
    $config["db_pass"],
    $config["db_name"]
);

if ($conn->connect_error) {

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}

$result = $conn->query("
SELECT
id,
company_name,
phone,
whatsapp,
email,
business_hours,
address,
map_embed,
facebook,
instagram,
youtube,
linkedin,
logo
FROM website_settings
LIMIT 1
");

if ($result && $result->num_rows > 0) {

    echo json_encode([
        "success" => true,
        "data" => $result->fetch_assoc()
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Settings not found."
    ]);

}

$conn->close();