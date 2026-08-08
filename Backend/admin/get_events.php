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


/*
|--------------------------------------------------------------------------
| Get Events
|--------------------------------------------------------------------------
*/

$events = [];

$result = $conn->query("
    SELECT *
    FROM events
    ORDER BY event_date DESC
");

if (!$result) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load events."
    ]);

    $conn->close();

    exit;
}

while ($row = $result->fetch_assoc()) {

    $images = [];
    $videos = [];

    /*
    |--------------------------------------------------------------------------
    | Load Event Media
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            media_type,
            media_url
        FROM event_media
        WHERE event_id = ?
        ORDER BY id ASC
    ");

    $stmt->bind_param(
        "i",
        $row["id"]
    );

    $stmt->execute();

    $media = $stmt->get_result();

    while ($m = $media->fetch_assoc()) {

        $item = [

            "type" => $m["media_type"],

            "url" => $m["media_url"]

        ];

        if ($m["media_type"] === "image") {

            $images[] = $item;

        } else {

            $videos[] = $item;

        }

    }

    $stmt->close();


    /*
    |--------------------------------------------------------------------------
    | Event Object
    |--------------------------------------------------------------------------
    */

    $events[] = [

        "id" => (int)$row["id"],

        "title" => $row["title"],

        "category" => $row["category"],

        "event_date" => $row["event_date"],

        "status" => $row["status"],

        // Cloudinary Cover URL
        "cover" => $row["cover_image_url"] ?? "",

        "images" => $images,

        "videos" => $videos

    ];

}


/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "data" => $events

]);

$conn->close();

?>