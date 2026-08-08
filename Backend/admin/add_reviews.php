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

$name = trim($data["name"] ?? "");
$role = trim($data["role"] ?? "");
$date = trim($data["date"] ?? "");
$rating = (int) ($data["rating"] ?? 5);
$review = trim($data["review"] ?? "");

if ($name === "" || $date === "" || $review === "") {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Name, date and review are required."
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
    INSERT INTO testimonials
    (name, role, date, rating, review)
    VALUES (?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "sssis",
    $name,
    $role,
    $date,
    $rating,
    $review
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Testimonial added successfully.",
        "id" => $stmt->insert_id
    ]);

} else {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to add testimonial."
    ]);
}

$stmt->close();
$conn->close();