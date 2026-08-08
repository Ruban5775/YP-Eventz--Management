<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// Handle CORS preflight request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// Only allow POST after preflight
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
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

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

$maxImageSize = 5 * 1024 * 1024; // 5 MB
$maxVideoSize = 15 * 1024 * 1024; // 15 MB

$maxImageWidth = 1920;
$maxImageHeight = 1920;

$imageQuality = 80;


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
        "message" => "Invalid Event ID."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Verify Event Exists
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT id
    FROM events
    WHERE id = ?
    LIMIT 1
");

$stmt->bind_param(
    "i",
    $event_id
);

$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {

    $stmt->close();

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Event not found."
    ]);

    $conn->close();

    exit;
}

$stmt->close();


/*
|--------------------------------------------------------------------------
| Event Upload Folder
|--------------------------------------------------------------------------
*/

$folder =
    "../uploads/events/" .
    $event_id .
    "/";

if (!is_dir($folder)) {

    if (!mkdir(
        $folder,
        0777,
        true
    )) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Unable to create event upload directory."
        ]);

        $conn->close();

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| Get Actual Image MIME Type
|--------------------------------------------------------------------------
*/

function getImageMimeType($source)
{
    $info = @getimagesize($source);

    if (!$info || !isset($info["mime"])) {
        return false;
    }

    return $info["mime"];
}


/*
|--------------------------------------------------------------------------
| Validate Image
|--------------------------------------------------------------------------
*/

function isAllowedImage($source)
{
    $mime = getImageMimeType($source);

    $allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    return $mime &&
        in_array(
            $mime,
            $allowedMimeTypes,
            true
        );
}


/*
|--------------------------------------------------------------------------
| Convert / Resize Image To WebP
|--------------------------------------------------------------------------
|
| Supports:
| JPG
| JPEG
| PNG
| WEBP
|
| Maximum stored dimensions:
| 1920 x 1920
|
|--------------------------------------------------------------------------
*/

function convertToWebp(
    $source,
    $destination,
    $quality = 80,
    $maxWidth = 1920,
    $maxHeight = 1920
) {

    $info = @getimagesize($source);

    if (
        !$info ||
        !isset($info["mime"])
    ) {
        return false;
    }


    /*
    |--------------------------------------------------------------------------
    | Create Image Resource
    |--------------------------------------------------------------------------
    */

    switch ($info["mime"]) {

        case "image/jpeg":

            $image =
                @imagecreatefromjpeg(
                    $source
                );

            break;


        case "image/png":

            $image =
                @imagecreatefrompng(
                    $source
                );

            break;


        case "image/webp":

            if (
                !function_exists(
                    "imagecreatefromwebp"
                )
            ) {
                return false;
            }

            $image =
                @imagecreatefromwebp(
                    $source
                );

            break;


        default:

            return false;
    }


    if (!$image) {
        return false;
    }


    /*
    |--------------------------------------------------------------------------
    | Original Dimensions
    |--------------------------------------------------------------------------
    */

    $originalWidth =
        imagesx($image);

    $originalHeight =
        imagesy($image);


    /*
    |--------------------------------------------------------------------------
    | Calculate New Dimensions
    |--------------------------------------------------------------------------
    */

    $newWidth =
        $originalWidth;

    $newHeight =
        $originalHeight;


    if (
        $originalWidth > $maxWidth ||
        $originalHeight > $maxHeight
    ) {

        $ratio = min(
            $maxWidth / $originalWidth,
            $maxHeight / $originalHeight
        );

        $newWidth =
            (int) round(
                $originalWidth * $ratio
            );

        $newHeight =
            (int) round(
                $originalHeight * $ratio
            );
    }


    /*
    |--------------------------------------------------------------------------
    | Resize If Required
    |--------------------------------------------------------------------------
    */

    if (
        $newWidth !== $originalWidth ||
        $newHeight !== $originalHeight
    ) {

        $resized =
            imagecreatetruecolor(
                $newWidth,
                $newHeight
            );


        /*
        |--------------------------------------------------------------------------
        | Preserve Transparency
        |--------------------------------------------------------------------------
        */

        imagealphablending(
            $resized,
            false
        );

        imagesavealpha(
            $resized,
            true
        );


        $transparent =
            imagecolorallocatealpha(
                $resized,
                0,
                0,
                0,
                127
            );


        imagefilledrectangle(
            $resized,
            0,
            0,
            $newWidth,
            $newHeight,
            $transparent
        );


        imagecopyresampled(
            $resized,
            $image,
            0,
            0,
            0,
            0,
            $newWidth,
            $newHeight,
            $originalWidth,
            $originalHeight
        );


        imagedestroy(
            $image
        );

        $image =
            $resized;

    } else {

        /*
        |--------------------------------------------------------------------------
        | Preserve PNG / WebP Transparency
        |--------------------------------------------------------------------------
        */

        imagealphablending(
            $image,
            true
        );

        imagesavealpha(
            $image,
            true
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Save As WebP
    |--------------------------------------------------------------------------
    */

    $saved =
        imagewebp(
            $image,
            $destination,
            $quality
        );


    imagedestroy(
        $image
    );


    return $saved;
}


/*
|--------------------------------------------------------------------------
| Cover Image
|--------------------------------------------------------------------------
*/

if (
    isset($_FILES["cover"]) &&
    $_FILES["cover"]["error"] === UPLOAD_ERR_OK
) {

    /*
    |--------------------------------------------------------------------------
    | Validate Size
    |--------------------------------------------------------------------------
    */

    if (
        $_FILES["cover"]["size"] >
        $maxImageSize
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Cover image exceeds 5 MB. Please upload an image smaller than 5 MB."
        ]);

        $conn->close();

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Validate Actual Image Type
    |--------------------------------------------------------------------------
    */

    if (
        !isAllowedImage(
            $_FILES["cover"]["tmp_name"]
        )
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Invalid cover image. Only JPG, JPEG, PNG and WEBP images are allowed."
        ]);

        $conn->close();

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Save Cover
    |--------------------------------------------------------------------------
    */

    $coverName =
        "cover.webp";

    $coverPath =
        $folder .
        $coverName;


    if (
        !convertToWebp(
            $_FILES["cover"]["tmp_name"],
            $coverPath,
            $imageQuality,
            $maxImageWidth,
            $maxImageHeight
        )
    ) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Unable to process cover image."
        ]);

        $conn->close();

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Update Event Cover
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        UPDATE events
        SET cover_image = ?
        WHERE id = ?
    ");

    $stmt->bind_param(
        "si",
        $coverName,
        $event_id
    );

    if (!$stmt->execute()) {

        $stmt->close();

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Cover image uploaded but database update failed."
        ]);

        $conn->close();

        exit;
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
    count($_FILES["images"]["name"]) > 0 &&
    $_FILES["images"]["error"][0] === UPLOAD_ERR_OK
) {

    $total =
        count(
            $_FILES["images"]["name"]
        );


    /*
    |--------------------------------------------------------------------------
    | STEP 1 - Validate ALL Images First
    |--------------------------------------------------------------------------
    |
    | Important:
    | Old gallery is NOT deleted until every new image passes validation.
    |
    |--------------------------------------------------------------------------
    */

    for (
        $i = 0;
        $i < $total;
        $i++
    ) {

        if (
            $_FILES["images"]["error"][$i]
            !== UPLOAD_ERR_OK
        ) {

            continue;
        }


        /*
        |--------------------------------------------------------------------------
        | Size Validation
        |--------------------------------------------------------------------------
        */

        if (
            $_FILES["images"]["size"][$i]
            > $maxImageSize
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" =>
                    $_FILES["images"]["name"][$i] .
                    " exceeds 5 MB. Please upload an image smaller than 5 MB."
            ]);

            $conn->close();

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | MIME Validation
        |--------------------------------------------------------------------------
        */

        if (
            !isAllowedImage(
                $_FILES["images"]["tmp_name"][$i]
            )
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" =>
                    $_FILES["images"]["name"][$i] .
                    " is not a valid image. Only JPG, JPEG, PNG and WEBP are allowed."
            ]);

            $conn->close();

            exit;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | STEP 2 - Delete Old Gallery Image Files
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT file_name
        FROM event_media
        WHERE event_id = ?
        AND media_type = 'image'
    ");

    $stmt->bind_param(
        "i",
        $event_id
    );

    $stmt->execute();

    $result =
        $stmt->get_result();


    while (
        $row =
        $result->fetch_assoc()
    ) {

        $file =
            $folder .
            $row["file_name"];

        if (
            file_exists($file)
        ) {

            @unlink($file);
        }
    }

    $stmt->close();


    /*
    |--------------------------------------------------------------------------
    | STEP 3 - Delete Old Gallery DB Records
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        DELETE FROM event_media
        WHERE event_id = ?
        AND media_type = 'image'
    ");

    $stmt->bind_param(
        "i",
        $event_id
    );

    $stmt->execute();

    $stmt->close();


    /*
    |--------------------------------------------------------------------------
    | STEP 4 - Prepare Insert Once
    |--------------------------------------------------------------------------
    */

    $insertImage =
        $conn->prepare("
            INSERT INTO event_media
            (
                event_id,
                media_type,
                file_name
            )
            VALUES (?, ?, ?)
        ");


    /*
    |--------------------------------------------------------------------------
    | STEP 5 - Process New Gallery Images
    |--------------------------------------------------------------------------
    */

    for (
        $i = 0;
        $i < $total;
        $i++
    ) {

        if (
            $_FILES["images"]["error"][$i]
            !== UPLOAD_ERR_OK
        ) {

            continue;
        }


        $tmp =
            $_FILES["images"]["tmp_name"][$i];


        $fileName =
            "img_" .
            uniqid("", true) .
            ".webp";


        /*
        |--------------------------------------------------------------------------
        | Convert / Resize
        |--------------------------------------------------------------------------
        */

        if (
            !convertToWebp(
                $tmp,
                $folder . $fileName,
                $imageQuality,
                $maxImageWidth,
                $maxImageHeight
            )
        ) {

            continue;
        }


        /*
        |--------------------------------------------------------------------------
        | Insert DB Record
        |--------------------------------------------------------------------------
        */

        $type =
            "image";


        $insertImage->bind_param(
            "iss",
            $event_id,
            $type,
            $fileName
        );


        $insertImage->execute();
    }


    $insertImage->close();
}


/*
|--------------------------------------------------------------------------
| Gallery Videos
|--------------------------------------------------------------------------
*/

if (
    isset($_FILES["videos"]) &&
    isset($_FILES["videos"]["name"]) &&
    count($_FILES["videos"]["name"]) > 0 &&
    $_FILES["videos"]["error"][0] === UPLOAD_ERR_OK
) {

    $total =
        count(
            $_FILES["videos"]["name"]
        );


    /*
    |--------------------------------------------------------------------------
    | STEP 1 - Validate ALL Videos
    |--------------------------------------------------------------------------
    */

    for (
        $i = 0;
        $i < $total;
        $i++
    ) {

        if (
            $_FILES["videos"]["error"][$i]
            !== UPLOAD_ERR_OK
        ) {

            continue;
        }


        /*
        |--------------------------------------------------------------------------
        | Size Validation
        |--------------------------------------------------------------------------
        */

        if (
            $_FILES["videos"]["size"][$i]
            > $maxVideoSize
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" =>
                    $_FILES["videos"]["name"][$i] .
                    " exceeds 15 MB. Please upload a compressed video."
            ]);

            $conn->close();

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Extension Validation
        |--------------------------------------------------------------------------
        */

        $extension =
            strtolower(
                pathinfo(
                    $_FILES["videos"]["name"][$i],
                    PATHINFO_EXTENSION
                )
            );


        if (
            $extension !== "mp4"
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" =>
                    "Only MP4 videos are allowed."
            ]);

            $conn->close();

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Basic MIME Validation
        |--------------------------------------------------------------------------
        */

        $finfo =
            new finfo(
                FILEINFO_MIME_TYPE
            );


        $mime =
            $finfo->file(
                $_FILES["videos"]["tmp_name"][$i]
            );


        $allowedVideoMimes = [
            "video/mp4",
            "application/mp4",
            "video/x-m4v"
        ];


        if (
            !in_array(
                $mime,
                $allowedVideoMimes,
                true
            )
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" =>
                    $_FILES["videos"]["name"][$i] .
                    " is not a valid MP4 video."
            ]);

            $conn->close();

            exit;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | STEP 2 - Delete Old Video Files
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT file_name
        FROM event_media
        WHERE event_id = ?
        AND media_type = 'video'
    ");

    $stmt->bind_param(
        "i",
        $event_id
    );

    $stmt->execute();

    $result =
        $stmt->get_result();


    while (
        $row =
        $result->fetch_assoc()
    ) {

        $file =
            $folder .
            $row["file_name"];


        if (
            file_exists($file)
        ) {

            @unlink($file);
        }
    }

    $stmt->close();


    /*
    |--------------------------------------------------------------------------
    | STEP 3 - Delete Old Video DB Records
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        DELETE FROM event_media
        WHERE event_id = ?
        AND media_type = 'video'
    ");

    $stmt->bind_param(
        "i",
        $event_id
    );

    $stmt->execute();

    $stmt->close();


    /*
    |--------------------------------------------------------------------------
    | STEP 4 - Prepare Insert Once
    |--------------------------------------------------------------------------
    */

    $insertVideo =
        $conn->prepare("
            INSERT INTO event_media
            (
                event_id,
                media_type,
                file_name
            )
            VALUES (?, ?, ?)
        ");


    /*
    |--------------------------------------------------------------------------
    | STEP 5 - Upload New Videos
    |--------------------------------------------------------------------------
    */

    for (
        $i = 0;
        $i < $total;
        $i++
    ) {

        if (
            $_FILES["videos"]["error"][$i]
            !== UPLOAD_ERR_OK
        ) {

            continue;
        }


        $fileName =
            "video_" .
            uniqid("", true) .
            ".mp4";


        if (
            !move_uploaded_file(
                $_FILES["videos"]["tmp_name"][$i],
                $folder . $fileName
            )
        ) {

            $insertVideo->close();

            http_response_code(500);

            echo json_encode([
                "success" => false,
                "message" =>
                    "Failed to upload video."
            ]);

            $conn->close();

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Insert Video Record
        |--------------------------------------------------------------------------
        */

        $type =
            "video";


        $insertVideo->bind_param(
            "iss",
            $event_id,
            $type,
            $fileName
        );


        $insertVideo->execute();
    }


    $insertVideo->close();
}


/*
|--------------------------------------------------------------------------
| Success Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => "Media uploaded successfully."
]);


$conn->close();