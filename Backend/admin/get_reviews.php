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
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}

$sql = "
    SELECT
        id,
        name,
        role,
        date,
        rating,
        review
    FROM testimonials
    ORDER BY date DESC, id DESC
";

$result = $conn->query($sql);

$testimonials = [];

while ($row = $result->fetch_assoc()) {
    $testimonials[] = [
        "id" => (int) $row["id"],
        "name" => $row["name"],
        "role" => $row["role"],
        "date" => $row["date"],
        "rating" => (int) $row["rating"],
        "review" => $row["review"]
    ];
}

echo json_encode([
    "success" => true,
    "data" => $testimonials
]);

$conn->close();