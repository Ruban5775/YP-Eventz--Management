<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
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

/*
|--------------------------------------------------------------------------
| Check uploaded logo
|--------------------------------------------------------------------------
*/

if (!isset($_FILES["logo"])) {
    echo json_encode([
        "success" => false,
        "message" => "No logo selected."
    ]);
    exit;
}

$file = $_FILES["logo"];

if ($file["error"] !== UPLOAD_ERR_OK) {
    echo json_encode([
        "success" => false,
        "message" => "Upload failed."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Validate file type
|--------------------------------------------------------------------------
*/

$allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml"
];

$fileInfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($fileInfo, $file["tmp_name"]);
finfo_close($fileInfo);

if (!in_array($mimeType, $allowedMimeTypes, true)) {
    echo json_encode([
        "success" => false,
        "message" => "Only PNG, JPG, JPEG, WEBP and SVG files are allowed."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Get current/old logo from database
|--------------------------------------------------------------------------
*/

$oldLogo = null;

$result = $conn->query("
    SELECT logo
    FROM website_settings
    WHERE id = 1
    LIMIT 1
");

if ($result && $row = $result->fetch_assoc()) {
    $oldLogo = $row["logo"];
}

/*
|--------------------------------------------------------------------------
| Generate unique filename
|--------------------------------------------------------------------------
*/

$extensionMap = [
    "image/png" => "png",
    "image/jpeg" => "jpg",
    "image/webp" => "webp",
    "image/svg+xml" => "svg"
];

$extension = $extensionMap[$mimeType];

/*
Example:
logo_20260716_134530_a8f31c2d.png
*/

$fileName =
    "logo_" .
    date("Ymd_His") .
    "_" .
    bin2hex(random_bytes(4)) .
    "." .
    $extension;

$uploadDirectory = "../uploads/";
$uploadPath = $uploadDirectory . $fileName;

/*
|--------------------------------------------------------------------------
| Make sure upload directory exists
|--------------------------------------------------------------------------
*/

if (!is_dir($uploadDirectory)) {
    mkdir($uploadDirectory, 0755, true);
}

/*
|--------------------------------------------------------------------------
| Upload new logo
|--------------------------------------------------------------------------
*/

if (!move_uploaded_file($file["tmp_name"], $uploadPath)) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to save logo."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Update database with new logo filename
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    UPDATE website_settings
    SET logo = ?
    WHERE id = 1
");

$stmt->bind_param("s", $fileName);

if ($stmt->execute()) {

    /*
    |--------------------------------------------------------------------------
    | Delete old logo
    |--------------------------------------------------------------------------
    |
    | Only delete after the database has been successfully updated.
    |
    */

    if (!empty($oldLogo) && $oldLogo !== $fileName) {

        // basename prevents path traversal
        $safeOldLogo = basename($oldLogo);

        $oldLogoPath = $uploadDirectory . $safeOldLogo;

        if (is_file($oldLogoPath)) {
            unlink($oldLogoPath);
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Logo updated successfully.",
        "logo" => $fileName
    ]);

} else {

    /*
    |--------------------------------------------------------------------------
    | DB update failed - delete newly uploaded file
    |--------------------------------------------------------------------------
    |
    | Prevent unused/orphan logo files from remaining in uploads.
    |
    */

    if (is_file($uploadPath)) {
        unlink($uploadPath);
    }

    echo json_encode([
        "success" => false,
        "message" => "Database update failed."
    ]);
}

$stmt->close();
$conn->close();