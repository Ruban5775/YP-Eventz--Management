<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
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

$data = json_decode(file_get_contents("php://input"), true);

$eventId = intval($data["id"] ?? 0);

if ($eventId <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid Event ID."
    ]);

    exit;

}

/*
|--------------------------------------------------------------------------
| Begin Transaction
|--------------------------------------------------------------------------
*/

$conn->begin_transaction();

try {

    /*
    |--------------------------------------------------------------------------
    | Verify Event Exists
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT id
        FROM events
        WHERE id=?
        LIMIT 1
    ");

    $stmt->bind_param("i", $eventId);

    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {

        throw new Exception("Event not found.");

    }

    $stmt->close();

    /*
    |--------------------------------------------------------------------------
    | Delete Event Media
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        DELETE
        FROM event_media
        WHERE event_id=?
    ");

    $stmt->bind_param("i", $eventId);

    if (!$stmt->execute()) {

        throw new Exception("Unable to delete event media.");

    }

    $stmt->close();

    /*
    |--------------------------------------------------------------------------
    | Delete Event
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        DELETE
        FROM events
        WHERE id=?
    ");

    $stmt->bind_param("i", $eventId);

    if (!$stmt->execute()) {

        throw new Exception("Unable to delete event.");

    }

    $stmt->close();

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    $conn->commit();

    echo json_encode([

        "success" => true,

        "message" => "Event deleted successfully.",

        "folder" => "ypeventz/event_" . $eventId

    ]);

} catch (Throwable $e) {

    $conn->rollback();

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" => $e->getMessage()

    ]);

}

$conn->close();