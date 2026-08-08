<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");


// Handle CORS preflight request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}


// Only POST requests allowed
if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);

    exit;
}


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


// Get JSON request body
$data = json_decode(
    file_get_contents("php://input"),
    true
);


if (!$data) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request data."
    ]);

    exit;
}


$currentPassword = trim(
    $data["current_password"] ?? ""
);

$newPassword = trim(
    $data["new_password"] ?? ""
);

$confirmPassword = trim(
    $data["confirm_password"] ?? ""
);


// Check empty fields
if (
    $currentPassword === "" ||
    $newPassword === "" ||
    $confirmPassword === ""
) {

    echo json_encode([
        "success" => false,
        "message" => "Please fill all password fields."
    ]);

    exit;
}


// Minimum 6 characters
if (strlen($newPassword) < 6) {

    echo json_encode([
        "success" => false,
        "message" => "New password must be at least 6 characters."
    ]);

    exit;
}


// Confirm passwords
if ($newPassword !== $confirmPassword) {

    echo json_encode([
        "success" => false,
        "message" => "New passwords do not match."
    ]);

    exit;
}


// Prevent same password
if ($currentPassword === $newPassword) {

    echo json_encode([
        "success" => false,
        "message" => "New password must be different from current password."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get Admin Account
|--------------------------------------------------------------------------
|
| For now we use the username directly.
| When we implement login, we can use the authenticated session instead.
|
*/

$username = "ypeventz";


$stmt = $conn->prepare("
    SELECT id, password
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


if ($result->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Admin account not found."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}


$admin = $result->fetch_assoc();

$stmt->close();


/*
|--------------------------------------------------------------------------
| Verify Current Password
|--------------------------------------------------------------------------
*/

if (!password_verify(
    $currentPassword,
    $admin["password"]
)) {

    echo json_encode([
        "success" => false,
        "message" => "Current password is incorrect."
    ]);

    $conn->close();

    exit;
}


/*
|--------------------------------------------------------------------------
| Hash New Password
|--------------------------------------------------------------------------
*/

$newPasswordHash = password_hash(
    $newPassword,
    PASSWORD_DEFAULT
);


/*
|--------------------------------------------------------------------------
| Update Password
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    UPDATE admin_users
    SET password = ?
    WHERE id = ?
");


$stmt->bind_param(
    "si",
    $newPasswordHash,
    $admin["id"]
);


if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Password updated successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Unable to update password."
    ]);

}


$stmt->close();

$conn->close();

?>