<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

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

$data = json_decode(file_get_contents("php://input"), true);

$title = trim($data["title"] ?? "");
$description = trim($data["description"] ?? "");
$items = trim($data["items"] ?? "");
$icon = trim($data["icon"] ?? "briefcase");
$status = trim($data["status"] ?? "Active");

if (
    $title == "" ||
    $description == "" ||
    $items == "" ||
    $icon == ""
) {

    echo json_encode([
        "success" => false,
        "message" => "Please fill all fields."
    ]);

    exit;
}

$stmt = $conn->prepare("
INSERT INTO services
(
title,
description,
items,
icon,
status
)
VALUES
(
?,?,?,?,?
)
");

$stmt->bind_param(
    "sssss",
    $title,
    $description,
    $items,
    $icon,
    $status
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Service added successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Unable to add service."
    ]);

}

$stmt->close();
$conn->close();