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

if ($id <= 0) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid testimonial ID."
    ]);

    exit;
}

$stmt = $conn->prepare("
    DELETE FROM testimonials
    WHERE id = ?
");

$stmt->bind_param("i", $id);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Testimonial deleted successfully."
    ]);

} else {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to delete testimonial."
    ]);
}

$stmt->close();
$conn->close();