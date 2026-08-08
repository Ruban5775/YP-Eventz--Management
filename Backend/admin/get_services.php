<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$config=require "../config.php";

$conn=new mysqli(

$config["db_host"],
$config["db_user"],
$config["db_pass"],
$config["db_name"]

);

$result=$conn->query(

"SELECT *
FROM services
ORDER BY id DESC"

);

$services=[];

while($row=$result->fetch_assoc()){

    $services[]=[

    "id" => $row["id"],
    "title" => $row["title"],
    "description" => $row["description"],
    "items" => $row["items"],
    "status" => $row["status"],
    "icon" => $row["icon"]

    ];

}

echo json_encode([

"success"=>true,
"data"=>$services

]);

$conn->close();