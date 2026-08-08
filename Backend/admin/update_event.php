<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
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

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data["id"]);

$title = trim($data["title"]);

$category = trim($data["category"]);

$event_date = $data["event_date"];

$status = $data["status"];

$stmt = $conn->prepare(
"
UPDATE events

SET
title=?,
category=?,
event_date=?,
status=?

WHERE id=?
"
);

$stmt->bind_param(

"ssssi",

$title,
$category,
$event_date,
$status,
$id

);

if($stmt->execute()){

    echo json_encode([

        "success"=>true,
        "message"=>"Event updated."

    ]);

}else{

    echo json_encode([

        "success"=>false,
        "message"=>"Unable to update event."

    ]);

}

$stmt->close();

$conn->close();