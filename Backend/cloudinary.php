<?php

require_once __DIR__ . "/vendor/autoload.php";

use Cloudinary\Cloudinary;

$cloudinaryConfig = [

    "cloud_name" => "#",

    "api_key" => "#",

    "api_secret" => "#"

];

$cloudinary = new Cloudinary([

    "cloud" => [

        "cloud_name" => $cloudinaryConfig["cloud_name"],

        "api_key" => $cloudinaryConfig["api_key"],

        "api_secret" => $cloudinaryConfig["api_secret"]

    ],

    "url" => [

        "secure" => true

    ]

]);

return [

    "client" => $cloudinary,

    "config" => $cloudinaryConfig

];
