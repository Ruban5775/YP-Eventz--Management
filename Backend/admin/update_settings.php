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

$id = intval($data["id"] ?? 1);

$company_name = trim($data["company_name"] ?? "");
$phone = trim($data["phone"] ?? "");
$whatsapp = trim($data["whatsapp"] ?? "");
$email = trim($data["email"] ?? "");
$business_hours = trim($data["business_hours"] ?? "");
$address = trim($data["address"] ?? "");
$map_embed = trim($data["map_embed"] ?? "");
$facebook = trim($data["facebook"] ?? "");
$instagram = trim($data["instagram"] ?? "");
$youtube = trim($data["youtube"] ?? "");
$linkedin = trim($data["linkedin"] ?? "");

if (
    $company_name == "" ||
    $phone == "" ||
    $email == ""
) {

    echo json_encode([
        "success" => false,
        "message" => "Please fill all required fields."
    ]);

    exit;
}

$stmt = $conn->prepare("
UPDATE website_settings
SET

company_name=?,
phone=?,
whatsapp=?,
email=?,
business_hours=?,
address=?,
map_embed=?,
facebook=?,
instagram=?,
youtube=?,
linkedin=?

WHERE id=?
");

$stmt->bind_param(

"sssssssssssi",

$company_name,
$phone,
$whatsapp,
$email,
$business_hours,
$address,
$map_embed,
$facebook,
$instagram,
$youtube,
$linkedin,
$id

);

if($stmt->execute()){

    echo json_encode([
        "success"=>true,
        "message"=>"Website settings updated successfully."
    ]);

}else{

    echo json_encode([
        "success"=>false,
        "message"=>"Unable to update settings."
    ]);

}

$stmt->close();
$conn->close();