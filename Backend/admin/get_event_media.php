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

$eventId = intval($_GET["event_id"] ?? 0);

if ($eventId <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid Event ID."
    ]);

    exit;

}

$stmt = $conn->prepare("
    SELECT
        id,
        media_type,
        media_url
    FROM event_media
    WHERE event_id=?
    ORDER BY id ASC
");

$stmt->bind_param("i", $eventId);

$stmt->execute();

$result = $stmt->get_result();

$data = [];

while ($row = $result->fetch_assoc()) {

    $data[] = [

        "id" => (int)$row["id"],

        "media_type" => $row["media_type"],

        "media_url" => $row["media_url"]

    ];

}

$stmt->close();

echo json_encode([

    "success" => true,

    "data" => $data

]);

$conn->close();