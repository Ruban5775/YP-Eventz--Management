<?php
if (!defined('SECURE_ACCESS')) {
    die('Direct access not allowed');
}

// config.php

return [


    // // MySQL local settings (default XAMPP)
    'db_host' => 'localhost',
    'db_name' => '#',
    'db_user' => 'root',
    'db_pass' => '',  



    // 'make_webhook_url' => '#',


    // SMTP Configuration
    "smtp_host" => "smtp.gmail.com",
    "smtp_port" => 587,
    "smtp_username" => "#",
    "smtp_password" => "#",


    // Sender Details
    "mail_from" => "#",
    "mail_from_name" => "Yours Perfect Eventz Management",


    // Company Email - Receives New Lead Notifications
    "company_email" => "#"

];




