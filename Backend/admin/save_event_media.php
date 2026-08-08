<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

    exit;
}

$config = require "../config.php";
$cloud = require "../cloudinary.php";

$cloudinary = $cloud["client"];

use Cloudinary\Api\Upload\UploadApi;

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

if (!$data) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid request."
    ]);

    exit;

}

$eventId = intval(
    $data["event_id"] ?? 0
);

$isEdit = boolval(
    $data["isEdit"] ?? false
);

$cover = $data["cover"] ?? null;

$images = $data["images"] ?? [];

$videos = $data["videos"] ?? [];

if ($eventId <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid event."
    ]);

    exit;

}


/*
|--------------------------------------------------------------------------
| Cloudinary Helper
|--------------------------------------------------------------------------
*/

// function deleteCloudinaryAsset($publicId, $resourceType = "image")
// {

//     if (!$publicId) {
//         return;
//     }

//     try {

//         $uploadApi = new UploadApi();

//         $uploadApi->destroy(

//             $publicId,

//             [

//                 "resource_type" => $resourceType,

//                 "invalidate" => true

//             ]

//         );

//     } catch (Exception $e) {

//         error_log(

//             "Cloudinary Delete Failed : " .

//             $e->getMessage()

//         );

//     }

// }


/*
|--------------------------------------------------------------------------
| Begin Transaction
|--------------------------------------------------------------------------
*/

$conn->begin_transaction();

try {
        /*
    |--------------------------------------------------------------------------
    | Update Cover Image
    |--------------------------------------------------------------------------
    */

    if ($cover !== null) {

        /*
        |--------------------------------------------------------------
        | Get Existing Cover
        |--------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            SELECT
                cover_image_url,
                cover_public_id
            FROM events
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->bind_param(
            "i",
            $eventId
        );

        $stmt->execute();

        $old = $stmt->get_result()->fetch_assoc();

        $stmt->close();


        /*
        |--------------------------------------------------------------
        | Delete Old Cover
        |--------------------------------------------------------------
        */

        // if (
        //     $old &&
        //     !empty($old["cover_public_id"])
        // ) {

        //     deleteCloudinaryAsset(

        //         $old["cover_public_id"],

        //         "image"

        //     );

        // }


        /*
        |--------------------------------------------------------------
        | Save New Cover
        |--------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            UPDATE events

            SET

                cover_image_url = ?,

                cover_public_id = ?

            WHERE id = ?
        ");

        $stmt->bind_param(

            "ssi",

            $cover["media_url"],

            $cover["public_id"],

            $eventId

        );

        if (!$stmt->execute()) {

            throw new Exception(
                "Unable to update cover image."
            );

        }

        $stmt->close(); 

    }


    /*
    |--------------------------------------------------------------------------
    | Replace Gallery Images
    |--------------------------------------------------------------------------
    */

    if (!empty($images)) {

        /*
        |--------------------------------------------------------------
        | Load Existing Gallery
        |--------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            SELECT
                public_id
            FROM event_media
            WHERE
                event_id = ?
                AND media_type = 'image'
        ");

        $stmt->bind_param(
            "i",
            $eventId
        );

        $stmt->execute();

        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {

            if (!empty($row["public_id"])) {

                // deleteCloudinaryAsset(

                //     $row["public_id"],

                //     "image"

                // );

            }

        }

        $stmt->close();


        /*
        |--------------------------------------------------------------
        | Delete Existing Gallery Rows
        |--------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            DELETE
            FROM event_media
            WHERE
                event_id = ?
                AND media_type = 'image'
        ");

        $stmt->bind_param(
            "i",
            $eventId
        );

        if (!$stmt->execute()) {

            throw new Exception(
                "Unable to delete old gallery."
            );

        }

        $stmt->close();


        /*
        |--------------------------------------------------------------
        | Insert New Gallery
        |--------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            INSERT INTO event_media
            (
                event_id,
                media_type,
                media_url,
                public_id,
                sort_order
            )

            VALUES

            (
                ?, ?, ?, ?, ?
            )
        ");

        $sort = 1;

        foreach ($images as $image) {

            $type = "image";

            $stmt->bind_param(

                "isssi",

                $eventId,

                $type,

                $image["media_url"],

                $image["public_id"],

                $sort

            );

            if (!$stmt->execute()) {

                throw new Exception(
                    "Unable to save gallery image."
                );

            }

            $sort++;

        }

        $stmt->close();

    }

    /*
    |--------------------------------------------------------------------------
    | Continue with Videos...
    |--------------------------------------------------------------------------
    */

        /*
    |--------------------------------------------------------------------------
    | Replace Videos
    |--------------------------------------------------------------------------
    */

    if (!empty($videos)) {

        /*
        |--------------------------------------------------------------
        | Load Existing Videos
        |--------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            SELECT
                public_id
            FROM event_media
            WHERE
                event_id = ?
                AND media_type = 'video'
        ");

        $stmt->bind_param(
            "i",
            $eventId
        );

        $stmt->execute();

        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {

            if (!empty($row["public_id"])) {

                // deleteCloudinaryAsset(

                //     $row["public_id"],

                //     "video"

                // );

            }

        }

        $stmt->close();


        /*
        |--------------------------------------------------------------
        | Delete Existing Video Rows
        |--------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            DELETE
            FROM event_media
            WHERE
                event_id = ?
                AND media_type = 'video'
        ");

        $stmt->bind_param(
            "i",
            $eventId
        );

        if (!$stmt->execute()) {

            throw new Exception(
                "Unable to delete old videos."
            );

        }

        $stmt->close();


        /*
        |--------------------------------------------------------------
        | Insert New Videos
        |--------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            INSERT INTO event_media
            (
                event_id,
                media_type,
                media_url,
                public_id,
                sort_order
            )

            VALUES

            (
                ?, ?, ?, ?, ?
            )
        ");

        $sort = 1;

        foreach ($videos as $video) {

            $type = "video";

            $stmt->bind_param(

                "isssi",

                $eventId,

                $type,

                $video["media_url"],

                $video["public_id"],

                $sort

            );

            if (!$stmt->execute()) {

                throw new Exception(
                    "Unable to save video."
                );

            }

            $sort++;

        }

        $stmt->close();

    }


    /*
    |--------------------------------------------------------------------------
    | Commit Transaction
    |--------------------------------------------------------------------------
    */

    $conn->commit();

    echo json_encode([

        "success" => true,

        "message" => "Media saved successfully."

    ]);

} catch (Exception $e) {

    /*
    |--------------------------------------------------------------------------
    | Rollback
    |--------------------------------------------------------------------------
    */

    $conn->rollback();

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" => $e->getMessage()

    ]);

} finally {

    $conn->close();

}