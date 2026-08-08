<?php

define("SECURE_ACCESS", true);

/*
|--------------------------------------------------------------------------
| CORS Headers
|--------------------------------------------------------------------------
*/

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| Handle CORS Preflight Request
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}


/*
|--------------------------------------------------------------------------
| Only Allow POST Requests
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Invalid Request"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Load Configuration & Mailer
|--------------------------------------------------------------------------
*/

$config = require "config.php";

require_once "mailer.php";


/*
|--------------------------------------------------------------------------
| Allow PHP To Continue After Client Disconnect
|--------------------------------------------------------------------------
*/

ignore_user_abort(true);


/*
|--------------------------------------------------------------------------
| Database Connection
|--------------------------------------------------------------------------
*/

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
        "message" => "Database Connection Failed"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Read Form Data
|--------------------------------------------------------------------------
*/

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$phone = trim($data["phone"] ?? "");
$type = trim($data["type"] ?? "");
$eventDate = trim($data["eventDate"] ?? "");
$location = trim($data["location"] ?? "");
$message = trim($data["message"] ?? "");


/*
|--------------------------------------------------------------------------
| Validate Required Fields
|--------------------------------------------------------------------------
*/

if (
    $name === "" ||
    $email === "" ||
    $phone === "" ||
    $type === "" ||
    $eventDate === "" ||
    $location === "" ||
    $message === ""
) {

    echo json_encode([
        "success" => false,
        "message" => "Please fill all required fields."
    ]);

    $conn->close();

    exit;
}


/*
|--------------------------------------------------------------------------
| Validate Email
|--------------------------------------------------------------------------
*/

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address."
    ]);

    $conn->close();

    exit;
}


/*
|--------------------------------------------------------------------------
| Save Enquiry To Database
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    INSERT INTO contact_enquiries
    (
        name,
        email,
        phone,
        event_type,
        event_date,
        location,
        message
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?)
");

if (!$stmt) {

    $conn->close();

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare enquiry."
    ]);

    exit;
}


$stmt->bind_param(
    "sssssss",
    $name,
    $email,
    $phone,
    $type,
    $eventDate,
    $location,
    $message
);


if (!$stmt->execute()) {

    $stmt->close();
    $conn->close();

    echo json_encode([
        "success" => false,
        "message" => "Unable to save enquiry."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Enquiry Saved Successfully
|--------------------------------------------------------------------------
*/

$enquiryId = $conn->insert_id;

$stmt->close();
$conn->close();


/*
|--------------------------------------------------------------------------
| Send Success Response To Frontend
|--------------------------------------------------------------------------
|
| The enquiry has already been stored successfully.
|
*/

$response = json_encode([
    "success" => true,
    "message" => "Enquiry submitted successfully. Our team will get back to you soon."
]);

echo $response;


/*
|--------------------------------------------------------------------------
| Finish HTTP Response
|--------------------------------------------------------------------------
|
| PHP-FPM:
| fastcgi_finish_request() sends the response immediately.
|
| Other environments:
| We attempt to flush the response before processing emails.
|
*/

if (function_exists("fastcgi_finish_request")) {

    fastcgi_finish_request();

} else {

    if (ob_get_level() > 0) {
        @ob_end_flush();
    }

    @flush();
}


/*
|--------------------------------------------------------------------------
| Escape User Data For HTML Emails
|--------------------------------------------------------------------------
*/

$safeName = htmlspecialchars(
    $name,
    ENT_QUOTES,
    "UTF-8"
);

$safeEmail = htmlspecialchars(
    $email,
    ENT_QUOTES,
    "UTF-8"
);

$safePhone = htmlspecialchars(
    $phone,
    ENT_QUOTES,
    "UTF-8"
);

$safeType = htmlspecialchars(
    $type,
    ENT_QUOTES,
    "UTF-8"
);

$safeEventDate = htmlspecialchars(
    $eventDate,
    ENT_QUOTES,
    "UTF-8"
);

$safeLocation = htmlspecialchars(
    $location,
    ENT_QUOTES,
    "UTF-8"
);

$safeMessage = nl2br(
    htmlspecialchars(
        $message,
        ENT_QUOTES,
        "UTF-8"
    )
);


/*
|--------------------------------------------------------------------------
| Send Emails Using Single SMTP Connection
|--------------------------------------------------------------------------
*/

$mail = null;

try {

    /*
    |--------------------------------------------------------------------------
    | Create Mailer Once
    |--------------------------------------------------------------------------
    */

    $mail = createMailer($config);

    /*
    |--------------------------------------------------------------------------
    | Keep SMTP Connection Alive
    |--------------------------------------------------------------------------
    |
    | This allows both emails to use the same SMTP connection instead of
    | connecting and authenticating with the SMTP server twice.
    |
    */

    $mail->SMTPKeepAlive = true;


   /*
|--------------------------------------------------------------------------
| 1. Send Confirmation Email To Customer
|--------------------------------------------------------------------------
*/

$mail->addAddress(
    $email,
    $name
);

$mail->Subject =
    "We've Received Your Event Enquiry - Yours Perfect Eventz";

$mail->Body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
</head>

<body style='
    margin:0;
    padding:0;
    background-color:#f5f5f5;
    font-family:Arial, Helvetica, sans-serif;
    color:#222222;
'>

<table
    width='100%'
    cellpadding='0'
    cellspacing='0'
    border='0'
    style='background-color:#f5f5f5;'
>
<tr>
<td align='center' style='padding:30px 15px;'>

    <!-- Main Email Container -->

    <table
        width='100%'
        cellpadding='0'
        cellspacing='0'
        border='0'
        style='
            max-width:600px;
            background-color:#ffffff;
            border-radius:12px;
            overflow:hidden;
            border:1px solid #eeeeee;
        '
    >

        <!-- Brand Top Line -->

        <tr>
            <td
                style='
                    height:5px;
                    background-color:#e31e24;
                    font-size:0;
                    line-height:0;
                '
            >
                &nbsp;
            </td>
        </tr>


        <!-- Logo -->

        <tr>
            <td
                align='center'
                style='
                    padding:28px 30px 20px;
                    border-bottom:1px solid #eeeeee;
                '
            >

                <img
                    src='https://ypeventz.persyntra.com/YP-Logo.png'
                    alt='Yours Perfect Eventz Management'
                    width='110'
                    style='
                        display:block;
                        width:110px;
                        max-width:110px;
                        height:auto;
                        border:0;
                    '
                >

            </td>
        </tr>


        <!-- Main Content -->

        <tr>
            <td style='padding:35px 40px;'>

                <h1
                    style='
                        margin:0 0 18px;
                        padding:0;
                        font-size:26px;
                        line-height:1.3;
                        color:#111111;
                        font-weight:700;
                    '
                >
                    Thank You,
                    <span style='color:#e31e24;'>
                        {$safeName}!
                    </span>
                </h1>


                <p
                    style='
                        margin:0 0 16px;
                        font-size:15px;
                        line-height:1.7;
                        color:#555555;
                    '
                >
                    Thank you for reaching out to
                    <strong style='color:#222222;'>
                        Yours Perfect Eventz Management.
                    </strong>
                    We have successfully received your event enquiry.
                </p>


                <p
                    style='
                        margin:0 0 25px;
                        font-size:15px;
                        line-height:1.7;
                        color:#555555;
                    '
                >
                    Our team will carefully review your requirements
                    and get in touch with you soon to discuss your event.
                </p>


                <!-- Enquiry Details -->

                <table
                    width='100%'
                    cellpadding='0'
                    cellspacing='0'
                    border='0'
                    style='
                        background-color:#f8f8f8;
                        border-left:4px solid #e31e24;
                    '
                >

                    <tr>
                        <td style='padding:20px 22px;'>

                            <p
                                style='
                                    margin:0 0 15px;
                                    font-size:14px;
                                    font-weight:700;
                                    color:#111111;
                                    text-transform:uppercase;
                                    letter-spacing:0.5px;
                                '
                            >
                                Your Enquiry Details
                            </p>


                            <table
                                width='100%'
                                cellpadding='0'
                                cellspacing='0'
                                border='0'
                            >

                                <tr>
                                    <td
                                        style='
                                            padding:7px 0;
                                            font-size:14px;
                                            color:#777777;
                                            width:110px;
                                        '
                                    >
                                        Event Date
                                    </td>

                                    <td
                                        style='
                                            padding:7px 0;
                                            font-size:14px;
                                            color:#222222;
                                            font-weight:600;
                                        '
                                    >
                                        {$safeEventDate}
                                    </td>
                                </tr>


                                <tr>
                                    <td
                                        style='
                                            padding:7px 0;
                                            font-size:14px;
                                            color:#777777;
                                            width:110px;
                                        '
                                    >
                                        Location
                                    </td>

                                    <td
                                        style='
                                            padding:7px 0;
                                            font-size:14px;
                                            color:#222222;
                                            font-weight:600;
                                        '
                                    >
                                        {$safeLocation}
                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>

                </table>


                <!-- Closing Message -->

                <p
                    style='
                        margin:25px 0 0;
                        font-size:15px;
                        line-height:1.7;
                        color:#555555;
                    '
                >
                    We look forward to working with you and making
                    your event truly memorable.
                </p>


                <p
                    style='
                        margin:25px 0 0;
                        font-size:14px;
                        line-height:1.6;
                        color:#555555;
                    '
                >
                    Regards,<br>

                    <strong style='color:#111111;'>
                        Yours Perfect Eventz Management
                    </strong>
                </p>

            </td>
        </tr>


        <!-- Footer -->

        <tr>
            <td
                align='center'
                style='
                    padding:20px 30px;
                    background-color:#111111;
                '
            >

                <p
                    style='
                        margin:0;
                        font-size:12px;
                        line-height:1.6;
                        color:#bbbbbb;
                    '
                >
                    Yours Perfect Eventz Management
                </p>

                <p
                    style='
                        margin:4px 0 0;
                        font-size:11px;
                        line-height:1.6;
                        color:#888888;
                    '
                >
                    Salem, Tamil Nadu
                </p>

            </td>
        </tr>

    </table>

</td>
</tr>
</table>

</body>
</html>
";


$mail->AltBody =
    "Thank you {$name}.\n\n" .
    "We have successfully received your event enquiry.\n" .
    "Event Date: {$eventDate}\n" .
    "Location: {$location}\n\n" .
    "Our team at Yours Perfect Eventz Management will contact you soon.";


/*
|--------------------------------------------------------------------------
| Send Customer Email
|--------------------------------------------------------------------------
*/

try {

    $mail->send();

} catch (\Throwable $e) {

    error_log(
        "Customer confirmation email failed for enquiry ID " .
        $enquiryId .
        ": " .
        $e->getMessage()
    );
}


/*
|--------------------------------------------------------------------------
| Clear Customer-Specific Email Data
|--------------------------------------------------------------------------
|
| SMTP connection remains open because SMTPKeepAlive is enabled.
|
*/

$mail->clearAddresses();
$mail->clearReplyTos();
$mail->clearAttachments();
$mail->clearCustomHeaders();


/*
|--------------------------------------------------------------------------
| 2. Send New Lead Notification To Company
|--------------------------------------------------------------------------
*/

$mail->addAddress(
    $config["company_email"]
);


/*
|--------------------------------------------------------------------------
| Replying To This Email Replies Directly To Customer
|--------------------------------------------------------------------------
*/

$mail->addReplyTo(
    $email,
    $name
);


$mail->Subject =
    "New Event Enquiry - {$name} - {$type}";


$mail->Body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
</head>

<body style='
    margin:0;
    padding:0;
    background-color:#f5f5f5;
    font-family:Arial, Helvetica, sans-serif;
    color:#222222;
'>

<table
    width='100%'
    cellpadding='0'
    cellspacing='0'
    border='0'
    style='background-color:#f5f5f5;'
>
<tr>
<td align='center' style='padding:30px 15px;'>

    <!-- Main Email Container -->

    <table
        width='100%'
        cellpadding='0'
        cellspacing='0'
        border='0'
        style='
            max-width:650px;
            background-color:#ffffff;
            border-radius:12px;
            overflow:hidden;
            border:1px solid #eeeeee;
        '
    >

        <!-- Brand Top Line -->

        <tr>
            <td
                style='
                    height:5px;
                    background-color:#e31e24;
                    font-size:0;
                    line-height:0;
                '
            >
                &nbsp;
            </td>
        </tr>


        <!-- Header -->

        <tr>
            <td
                style='
                    padding:25px 35px;
                    border-bottom:1px solid #eeeeee;
                '
            >

                <table
                    width='100%'
                    cellpadding='0'
                    cellspacing='0'
                    border='0'
                >
                    <tr>

                        <td
                            width='120'
                            valign='middle'
                        >

                            <img
                                src='https://ypeventz.persyntra.com/YP-Logo.png'
                                alt='Yours Perfect Eventz Management'
                                width='95'
                                style='
                                    display:block;
                                    width:95px;
                                    max-width:95px;
                                    height:auto;
                                    border:0;
                                '
                            >

                        </td>


                        <td
                            align='right'
                            valign='middle'
                        >

                            <p
                                style='
                                    margin:0;
                                    font-size:12px;
                                    font-weight:700;
                                    text-transform:uppercase;
                                    letter-spacing:1px;
                                    color:#e31e24;
                                '
                            >
                                New Website Lead
                            </p>

                            <p
                                style='
                                    margin:5px 0 0;
                                    font-size:12px;
                                    color:#888888;
                                '
                            >
                                Enquiry #{$enquiryId}
                            </p>

                        </td>

                    </tr>
                </table>

            </td>
        </tr>


        <!-- Main Content -->

        <tr>
            <td style='padding:35px;'>

                <h1
                    style='
                        margin:0 0 10px;
                        font-size:25px;
                        line-height:1.3;
                        color:#111111;
                    '
                >
                    New Event Enquiry
                </h1>


                <p
                    style='
                        margin:0 0 25px;
                        font-size:14px;
                        line-height:1.7;
                        color:#666666;
                    '
                >
                    A new lead has submitted an event enquiry
                    through the website. The complete details
                    are provided below.
                </p>


                <!-- Lead Details -->

                <table
                    width='100%'
                    cellpadding='0'
                    cellspacing='0'
                    border='0'
                    style='
                        border:1px solid #eeeeee;
                        border-radius:8px;
                    '
                >

                    <tr style='background-color:#f8f8f8;'>
                        <td
                            colspan='2'
                            style='
                                padding:14px 18px;
                                font-size:13px;
                                font-weight:700;
                                text-transform:uppercase;
                                letter-spacing:0.5px;
                                color:#111111;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            Lead Information
                        </td>
                    </tr>


                    <tr>
                        <td
                            style='
                                width:140px;
                                padding:12px 18px;
                                font-size:13px;
                                color:#777777;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            Enquiry ID
                        </td>

                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                font-weight:600;
                                color:#222222;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            #{$enquiryId}
                        </td>
                    </tr>


                    <tr>
                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                color:#777777;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            Name
                        </td>

                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                font-weight:600;
                                color:#222222;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            {$safeName}
                        </td>
                    </tr>


                    <tr>
                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                color:#777777;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            Email
                        </td>

                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                color:#222222;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            {$safeEmail}
                        </td>
                    </tr>


                    <tr>
                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                color:#777777;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            Phone
                        </td>

                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                font-weight:600;
                                color:#222222;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            {$safePhone}
                        </td>
                    </tr>


                    <tr>
                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                color:#777777;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            Event Type
                        </td>

                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                font-weight:600;
                                color:#222222;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            {$safeType}
                        </td>
                    </tr>


                    <tr>
                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                color:#777777;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            Event Date
                        </td>

                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                font-weight:600;
                                color:#222222;
                                border-bottom:1px solid #eeeeee;
                            '
                        >
                            {$safeEventDate}
                        </td>
                    </tr>


                    <tr>
                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                color:#777777;
                            '
                        >
                            Location
                        </td>

                        <td
                            style='
                                padding:12px 18px;
                                font-size:13px;
                                font-weight:600;
                                color:#222222;
                            '
                        >
                            {$safeLocation}
                        </td>
                    </tr>

                </table>


                <!-- Customer Message -->

                <div
                    style='
                        margin-top:22px;
                        padding:20px;
                        background-color:#f8f8f8;
                        border-left:4px solid #e31e24;
                    '
                >

                    <p
                        style='
                            margin:0 0 10px;
                            font-size:13px;
                            font-weight:700;
                            text-transform:uppercase;
                            letter-spacing:0.5px;
                            color:#111111;
                        '
                    >
                        Customer Message
                    </p>

                    <p
                        style='
                            margin:0;
                            font-size:14px;
                            line-height:1.7;
                            color:#555555;
                        '
                    >
                        {$safeMessage}
                    </p>

                </div>


                <!-- Action Note -->

                <p
                    style='
                        margin:25px 0 0;
                        font-size:13px;
                        line-height:1.6;
                        color:#777777;
                    '
                >
                    Please review this enquiry and contact
                    the lead as soon as possible.
                </p>


                <p
                    style='
                        margin:8px 0 0;
                        font-size:12px;
                        color:#999999;
                    '
                >
                    You can reply directly to this email
                    to respond to {$safeName}.
                </p>

            </td>
        </tr>


        <!-- Footer -->

        <tr>
            <td
                align='center'
                style='
                    padding:18px 30px;
                    background-color:#111111;
                '
            >

                <p
                    style='
                        margin:0;
                        font-size:11px;
                        line-height:1.6;
                        color:#999999;
                    '
                >
                    Website Lead Notification &bull;
                    Yours Perfect Eventz Management
                </p>

            </td>
        </tr>

    </table>

</td>
</tr>
</table>

</body>
</html>
";


$mail->AltBody =
    "New Event Enquiry\n\n" .
    "Enquiry ID: {$enquiryId}\n" .
    "Name: {$name}\n" .
    "Email: {$email}\n" .
    "Phone: {$phone}\n" .
    "Event Type: {$type}\n" .
    "Event Date: {$eventDate}\n" .
    "Location: {$location}\n" .
    "Message: {$message}";


    /*
    |--------------------------------------------------------------------------
    | Send Company Email
    |--------------------------------------------------------------------------
    */

    try {

        $mail->send();

    } catch (\Throwable $e) {

        error_log(
            "Company notification email failed for enquiry ID " .
            $enquiryId .
            ": " .
            $e->getMessage()
        );
    }


} catch (\Throwable $e) {

    /*
    |--------------------------------------------------------------------------
    | Mailer / SMTP Connection Error
    |--------------------------------------------------------------------------
    */

    error_log(
        "Email system failed for enquiry ID " .
        $enquiryId .
        ": " .
        $e->getMessage()
    );

} finally {

    /*
    |--------------------------------------------------------------------------
    | Close SMTP Connection
    |--------------------------------------------------------------------------
    */

    if ($mail !== null) {

        try {
            $mail->smtpClose();
        } catch (\Throwable $e) {

            error_log(
                "SMTP close failed for enquiry ID " .
                $enquiryId .
                ": " .
                $e->getMessage()
            );
        }
    }
}

?>