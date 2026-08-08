<?php

define("SECURE_ACCESS",true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

$config=require "../config.php";

$conn=new mysqli(

$config["db_host"],
$config["db_user"],
$config["db_pass"], 
$config["db_name"]

);

if($conn->connect_error){

echo json_encode([
"success"=>false,
"message"=>"Database connection failed."
]);

exit;

}

$data=json_decode(file_get_contents("php://input"),true);

$title=trim($data["title"] ?? "");
$category=trim($data["category"] ?? "");
$event_date=trim($data["event_date"] ?? "");
$status=trim($data["status"] ?? "Active");

if(

$title=="" ||

$category=="" ||

$event_date==""

){

echo json_encode([
"success"=>false,
"message"=>"Please fill all fields."
]);

exit;

}

$stmt=$conn->prepare(

"INSERT INTO events
(
title,
category,
event_date,
status
)

VALUES

(
?,?,?,?
)"

);

$stmt->bind_param(

"ssss",

$title,
$category,
$event_date,
$status

);

if(!$stmt->execute()){

echo json_encode([
"success"=>false,
"message"=>"Unable to create event."
]);

exit;

}

$event_id=$conn->insert_id;



echo json_encode([

"success"=>true,

"message"=>"Event created.",

"event_id"=>$event_id

]);

$stmt->close();

$conn->close();