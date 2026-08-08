<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");


// Handle CORS preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}


// Only allow POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);

    exit;
}


// Load database config
$config = require "../config.php";


// Database connection
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


// Get JSON data
$data = json_decode(
    file_get_contents("php://input"),
    true
);


// Validate request data
if (!$data) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request data."
    ]);

    exit;
}


$username = trim(
    $data["username"] ?? ""
);

$password = $data["password"] ?? "";


// Validate fields
if ($username === "" || $password === "") {

    echo json_encode([
        "success" => false,
        "message" => "Username and password are required."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Find Admin
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT id, username, password
    FROM admin_users
    WHERE username = ?
    LIMIT 1
");


$stmt->bind_param(
    "s",
    $username
);


$stmt->execute();

$result = $stmt->get_result();


// Username not found
if ($result->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid username or password."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}


$admin = $result->fetch_assoc();

$stmt->close();


/*
|--------------------------------------------------------------------------
| Verify Password
|--------------------------------------------------------------------------
*/

if (!password_verify(
    $password,
    $admin["password"]
)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid username or password."
    ]);

    $conn->close();

    exit;
}


/*
|--------------------------------------------------------------------------
| Login Success
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => "Login successful.",
    "user" => [
        "id" => $admin["id"],
        "username" => $admin["username"]
    ]
]);


$conn->close();

?>