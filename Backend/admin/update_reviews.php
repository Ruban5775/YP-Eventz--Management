<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle browser CORS preflight request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

    exit();
}

$config = require "../config.php";

$conn = new mysqli(
    $config["db_host"],
    $config["db_user"],
    $config["db_pass"],
    $config["db_name"]
);

if ($conn->connect_error) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id = (int) ($data["id"] ?? 0);
$name = trim($data["name"] ?? "");
$role = trim($data["role"] ?? "");
$date = trim($data["date"] ?? "");
$rating = (int) ($data["rating"] ?? 5);
$review = trim($data["review"] ?? "");

if ($id <= 0 || $name === "" || $date === "" || $review === "") {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid testimonial data."
    ]);

    exit;
}

if ($rating < 1 || $rating > 5) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Rating must be between 1 and 5."
    ]);

    exit;
}

$stmt = $conn->prepare("
    UPDATE testimonials
    SET
        name = ?,
        role = ?,
        date = ?,
        rating = ?,
        review = ?
    WHERE id = ?
");

$stmt->bind_param(
    "sssisi",
    $name,
    $role,
    $date,
    $rating,
    $review,
    $id
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Testimonial updated successfully."
    ]);

} else {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to update testimonial."
    ]);
}

$stmt->close();
$conn->close();