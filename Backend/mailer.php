<?php

if (!defined("SECURE_ACCESS")) {
    exit("Direct access not allowed");
}

require_once __DIR__ . "/vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function createMailer($config)
{
    $mail = new PHPMailer(true);

    // SMTP Configuration
    $mail->isSMTP();

    $mail->Host = $config["smtp_host"];

    $mail->SMTPAuth = true;

    $mail->Username = $config["smtp_username"];

    $mail->Password = $config["smtp_password"];

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

    $mail->Port = $config["smtp_port"];


    // Character Encoding
    $mail->CharSet = "UTF-8";


    // Default Sender
    $mail->setFrom(
        $config["mail_from"],
        $config["mail_from_name"]
    );


    // HTML Email
    $mail->isHTML(true);


    return $mail;
}