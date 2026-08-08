<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

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


/*
|--------------------------------------------------------------------------
| Database
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
| Cloudinary
|--------------------------------------------------------------------------
*/

$cloudinary = require "../cloudinary.php";


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

$maxImageSize = 15 * 1024 * 1024; //15MB

$maxVideoSize = 25 * 1024 * 1024; //25MB

$allowedImages = [

    "image/jpeg",
    "image/png",
    "image/webp"

];

$allowedVideos = [
    "video/mp4",
    "video/x-m4v",
    "application/mp4",
    "video/quicktime",
    "video/mpeg",
    "video/x-msvideo"
];


/*
|--------------------------------------------------------------------------
| Validate Event ID
|--------------------------------------------------------------------------
*/

$event_id = intval($_POST["event_id"] ?? 0);

if ($event_id <= 0) {

    http_response_code(400);

    echo json_encode([

        "success" => false,
        "message" => "Invalid Event."

    ]);

    exit;

}


/*
|--------------------------------------------------------------------------
| Verify Event Exists
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare(

"
SELECT

id,
cover_public_id

FROM events

WHERE id=?

LIMIT 1

"

);

$stmt->bind_param(

"i",

$event_id

);

if(!$stmt->execute()){
    throw new Exception("Unable to Verify media.");
}

$result = $stmt->get_result();

if ($result->num_rows === 0) {

    echo json_encode([

        "success" => false,
        "message" => "Event not found."

    ]);

    exit;

}

$event = $result->fetch_assoc();

$stmt->close();


/*
|--------------------------------------------------------------------------
| Cloudinary Folder
|--------------------------------------------------------------------------
*/

$folder = "ypeventz/event_" . $event_id;


/*
|--------------------------------------------------------------------------
| Helper : Delete Cloudinary Asset
|--------------------------------------------------------------------------
*/

function deleteCloudinaryAsset($cloudinary, $publicId)
{

    if (!$publicId) {
        return;
    }

    try {

        $cloudinary
            ->uploadApi()
            ->destroy($publicId);

    } catch (Exception $e) {

        // Ignore missing asset

    }

}


/*
|--------------------------------------------------------------------------
| Helper : Delete Existing Gallery
|--------------------------------------------------------------------------
*/

function deleteGallery(
    $conn,
    $cloudinary,
    $event_id,
    $mediaType
)
{

    $stmt = $conn->prepare(

    "

    SELECT

    public_id

    FROM event_media

    WHERE

    event_id=?

    AND media_type=?

    "

    );

    $stmt->bind_param(

        "is",

        $event_id,

        $mediaType

    );

    if(!$stmt->execute()){
    throw new Exception("Unable to delete old media.");
}

    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {

        deleteCloudinaryAsset(

            $cloudinary,

            $row["public_id"]

        );

    }

    $stmt->close();


    $stmt = $conn->prepare(

    "

    DELETE

    FROM event_media

    WHERE

    event_id=?

    AND media_type=?

    "

    );

    $stmt->bind_param(

        "is",

        $event_id,

        $mediaType

    );

    if(!$stmt->execute()){
    throw new Exception("Unable to delete old media.");
}

    $stmt->close();

}


/*
|--------------------------------------------------------------------------
| Helper : Upload Image
|--------------------------------------------------------------------------
*/

function uploadImage(
    $cloudinary,
    $tmpFile,
    $folder
)
{

    return $cloudinary
        ->uploadApi()
        ->upload(

            $tmpFile,

            [

                "folder" => $folder,

                "resource_type" => "image",

            ]

        );

}


/*
|--------------------------------------------------------------------------
| Helper : Upload Video
|--------------------------------------------------------------------------
*/

function uploadVideo(
    $cloudinary,
    $tmpFile,
    $folder
)
{

    return $cloudinary
        ->uploadApi()
        ->upload(

            $tmpFile,

            [

                "folder" => $folder,

                "resource_type" => "video"

            ]

        );

}


/*
|--------------------------------------------------------------------------
| Helper : Validate Image
|--------------------------------------------------------------------------
*/

function validateImage(
    $file,
    $maxSize,
    $allowed
)
{

    if ($file["size"] > $maxSize) {

        throw new Exception(

            "Image exceeds 15 MB."

        );

    }

    $info = @getimagesize(

        $file["tmp_name"]

    );

    if (!$info) {

        throw new Exception(

            "Invalid image."

        );

    }

    if (!in_array(

        $info["mime"],

        $allowed,

        true

    )) {

        throw new Exception(

            "Only JPG, PNG and WEBP are allowed."

        );

    }

}


/*
|--------------------------------------------------------------------------
| Helper : Validate Video
|--------------------------------------------------------------------------
*/

function validateVideo(
    $file,
    $maxSize,
    $allowed
)
{

    if ($file["size"] > $maxSize) {

        throw new Exception(

            "Video exceeds 25 MB."

        );

    }

    $finfo = new finfo(

        FILEINFO_MIME_TYPE

    );

    $mime = $finfo->file(

        $file["tmp_name"]

    );
error_log("Video MIME: " . $mime);

    if (!in_array(

        $mime,

        $allowed,

        true

    )) {

        throw new Exception(

            "Only MP4 videos are allowed."

        );

    }

}

/*
|--------------------------------------------------------------------------
| Cover Image
|--------------------------------------------------------------------------
*/

try {

    if (
        isset($_FILES["cover"]) &&
        $_FILES["cover"]["error"] === UPLOAD_ERR_OK
    ) {

        validateImage(
            $_FILES["cover"],
            $maxImageSize,
            $allowedImages
        );

        if (!empty($event["cover_public_id"])) {

            deleteCloudinaryAsset(

                $cloudinary,

                $event["cover_public_id"]

            );

        }

        $coverResult = uploadImage(

            $cloudinary,

            $_FILES["cover"]["tmp_name"],

            $folder

        );

        $stmt = $conn->prepare(

        "

        UPDATE events

        SET

        cover_image_url=?,
        cover_public_id=?

        WHERE id=?

        "

        );

        $stmt->bind_param(

            "ssi",

            $coverResult["secure_url"],

            $coverResult["public_id"],

            $event_id

        );

        if(!$stmt->execute()){
    throw new Exception("Unable to save media.");
}

        $stmt->close();

    }


/*
|--------------------------------------------------------------------------
| Gallery Images
|--------------------------------------------------------------------------
*/

    if (

        isset($_FILES["images"]) &&

        isset($_FILES["images"]["name"]) &&

        count($_FILES["images"]["name"]) > 0

    ) {

        deleteGallery(

            $conn,

            $cloudinary,

            $event_id,

            "image"

        );

        $stmt = $conn->prepare(

        "

        INSERT INTO event_media

        (

            event_id,

            media_type,

            media_url,

            public_id

        )

        VALUES

        (

            ?,?,?,?

        )

        "

        );

        for (

            $i = 0;

            $i < count($_FILES["images"]["name"]);

            $i++

        ) {

            if (

                $_FILES["images"]["error"][$i]

                !== UPLOAD_ERR_OK

            ) {

                continue;

            }

            $file = [

                "tmp_name" => $_FILES["images"]["tmp_name"][$i],

                "size" => $_FILES["images"]["size"][$i]

            ];

            validateImage(

                $file,

                $maxImageSize,

                $allowedImages

            );

            $upload = uploadImage(

                $cloudinary,

                $_FILES["images"]["tmp_name"][$i],

                $folder

            );

            $type = "image";

            $stmt->bind_param(

                "isss",

                $event_id,

                $type,

                $upload["secure_url"],

                $upload["public_id"]

            );

            if(!$stmt->execute()){
           throw new Exception("Unable to save media.");
}

        }

        $stmt->close();

    }


/*
|--------------------------------------------------------------------------
| Gallery Videos
|--------------------------------------------------------------------------
*/

    if (

        isset($_FILES["videos"]) &&

        isset($_FILES["videos"]["name"]) &&

        count($_FILES["videos"]["name"]) > 0

    ) {

        deleteGallery(

            $conn,

            $cloudinary,

            $event_id,

            "video"

        );

        $stmt = $conn->prepare(

        "

        INSERT INTO event_media

        (

            event_id,

            media_type,

            media_url,

            public_id

        )

        VALUES

        (

            ?,?,?,?

        )

        "

        );

        for (

            $i = 0;

            $i < count($_FILES["videos"]["name"]);

            $i++

        ) {

            if (

                $_FILES["videos"]["error"][$i]

                !== UPLOAD_ERR_OK

            ) {

                continue;

            }

            $file = [

                "tmp_name" => $_FILES["videos"]["tmp_name"][$i],

                "size" => $_FILES["videos"]["size"][$i]

            ];

            validateVideo(

                $file,

                $maxVideoSize,

                $allowedVideos

            );

             error_log("Uploading video...");
            $upload = uploadVideo(

                $cloudinary,

                $_FILES["videos"]["tmp_name"][$i],

                $folder

            );
            error_log(json_encode($upload));

            $type = "video";

            $stmt->bind_param(

                "isss",

                $event_id,

                $type,

                $upload["secure_url"],

                $upload["public_id"]

            );

            if(!$stmt->execute()){
           throw new Exception("Unable to save media.");
}

        }

        $stmt->close();

    }

}
catch (Exception $e) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "message" => $e->getMessage()

    ]);

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
    "message" => "Media uploaded successfully."
]);

$conn->close();