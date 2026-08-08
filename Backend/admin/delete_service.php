<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

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

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data["id"] ?? 0);

if ($id <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid Service ID."
    ]);

    exit;
}

$stmt = $conn->prepare("DELETE FROM services WHERE id=?");

$stmt->bind_param("i", $id);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Service deleted successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Unable to delete service."
    ]);

}

$stmt->close();
$conn->close();