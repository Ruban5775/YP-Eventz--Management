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
        title,
        category,
        event_date,
        cover_image_url
    FROM events
    WHERE status='Active'
    ORDER BY event_date DESC
");

if (!$result) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to load events."
    ]);

    exit;

}

$data = [];

while ($row = $result->fetch_assoc()) {

    $data[] = [

        "id" => (int)$row["id"],

        "title" => $row["title"],

        "category" => $row["category"],

        "event_date" => $row["event_date"],

        "cover_image_url" => $row["cover_image_url"]

    ];

}

echo json_encode([

    "success" => true,

    "data" => $data

]);

$conn->close();