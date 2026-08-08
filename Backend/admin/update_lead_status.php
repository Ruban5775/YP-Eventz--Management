<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

$config = require "../config.php";

$conn = new mysqli(
    $config['db_host'],
    $config['db_user'],
    $config['db_pass'],
    $config['db_name']
);

if ($conn->connect_error) {

    echo json_encode([
        "success"=>false,
        "message"=>"Database connection failed"
    ]);

    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data["id"] ?? 0);
$status = trim($data["status"] ?? "");

$allowed = ["New","Contacted","Won","Lost"];

if($id <= 0 || !in_array($status,$allowed)){

    echo json_encode([
        "success"=>false,
        "message"=>"Invalid Request"
    ]);

    exit;
}

$stmt = $conn->prepare(
"UPDATE contact_enquiries
SET status=?
WHERE id=?"
);

$stmt->bind_param("si",$status,$id);

if($stmt->execute()){

    echo json_encode([
        "success"=>true,
        "message"=>"Status updated successfully."
    ]);

}else{

    echo json_encode([
        "success"=>false,
        "message"=>"Unable to update."
    ]);

}

$stmt->close();
$conn->close();