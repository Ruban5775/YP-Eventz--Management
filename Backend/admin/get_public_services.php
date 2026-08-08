<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$config = require "../config.php";

$conn = new mysqli(
    $config['db_host'],
    $config['db_user'],
    $config['db_pass'],
    $config['db_name']
);

if ($conn->connect_error) {

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}

$result = $conn->query("
    SELECT *
    FROM services
    WHERE status='Active'
    ORDER BY id ASC
");

$data = [];

while ($row = $result->fetch_assoc()) {

    $data[] = [

        "id" => $row["id"],

        // Default icon for now
        "icon" => $row["icon"],

        "title" => $row["title"],

        "description" => $row["description"],

        // Convert comma separated string to array
        "items" => array_map("trim", explode(",", $row["items"]))

    ];

}

echo json_encode([
    "success" => true,
    "data" => $data
]);

$conn->close();