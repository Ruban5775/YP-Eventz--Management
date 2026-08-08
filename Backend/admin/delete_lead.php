<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");


/*
|--------------------------------------------------------------------------
| Handle CORS Preflight
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}


/*
|--------------------------------------------------------------------------
| Only Allow POST
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Database Configuration
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Read Request
|--------------------------------------------------------------------------
*/

$data = json_decode(
    file_get_contents("php://input"),
    true
);


$id = isset($data["id"])
    ? (int) $data["id"]
    : 0;


if ($id <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid lead ID."
    ]);

    $conn->close();

    exit;
}


/*
|--------------------------------------------------------------------------
| Delete Lead
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare(
    "DELETE FROM contact_enquiries WHERE id = ?"
);


if (!$stmt) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare delete request."
    ]);

    $conn->close();

    exit;
}


$stmt->bind_param(
    "i",
    $id
);


if (!$stmt->execute()) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to delete lead."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}


/*
|--------------------------------------------------------------------------
| Check Whether Lead Actually Existed
|--------------------------------------------------------------------------
*/

if ($stmt->affected_rows === 0) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Lead not found."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}


/*
|--------------------------------------------------------------------------
| Success
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => "Lead deleted successfully."
]);


$stmt->close();

$conn->close();

?>