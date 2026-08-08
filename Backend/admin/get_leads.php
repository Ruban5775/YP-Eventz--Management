<?php

define('SECURE_ACCESS', true);


header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

$config = require "../config.php";

$conn = new mysqli(
    $config['db_host'],
    $config['db_user'],
    $config['db_pass'],
    $config['db_name']
);

if ($conn->connect_error) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);

    exit;
}

$sql = "SELECT
            id,
            name,
            email,
            phone,
            event_type,
            event_date,
            location,
            message,
            status,
            created_at
        FROM contact_enquiries
        ORDER BY created_at DESC";

$result = $conn->query($sql);

$leads = [];

while ($row = $result->fetch_assoc()) {

    $leads[] = [
        "id" => $row["id"],
        "name" => $row["name"],
        "email" => $row["email"],
        "phone" => $row["phone"],
        "type" => $row["event_type"],
        "date" => $row["event_date"],
        "location" => $row["location"],
        "message" => $row["message"],
        "status" => $row["status"]
    ];
}

echo json_encode([
    "success" => true,
    "data" => $leads
]);

$conn->close();