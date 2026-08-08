<?php

define("SECURE_ACCESS", true);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");

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


/*
|--------------------------------------------------------------------------
| Total Leads
|--------------------------------------------------------------------------
*/

$totalLeads = 0;

$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM contact_enquiries
");

if ($result) {
    $row = $result->fetch_assoc();
    $totalLeads = (int) $row["total"];
}


/*
|--------------------------------------------------------------------------
| Total Events
|--------------------------------------------------------------------------
*/

$totalEvents = 0;

$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM events
");

if ($result) {
    $row = $result->fetch_assoc();
    $totalEvents = (int) $row["total"];
}


/*
|--------------------------------------------------------------------------
| Total Services
|--------------------------------------------------------------------------
*/

$totalServices = 0;

$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM services
");

if ($result) {
    $row = $result->fetch_assoc();
    $totalServices = (int) $row["total"];
}


/*
|--------------------------------------------------------------------------
| Recent Leads
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Change the column names below if your contact_enquiries table
| uses different column names.
|
*/

$recentLeads = [];

$result = $conn->query("
    SELECT
        id,
        name,
        event_type,
        created_at,
        status
    FROM contact_enquiries
    ORDER BY created_at DESC
    LIMIT 5
");

if ($result) {

    while ($row = $result->fetch_assoc()) {

        $recentLeads[] = [
            "id" => (int) $row["id"],
            "name" => $row["name"],
            "type" => $row["event_type"],
            "date" => $row["created_at"],
            "status" => $row["status"]
        ];

    }

}


/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,

    "data" => [

        "stats" => [
            "total_leads" => $totalLeads,
            "total_events" => $totalEvents,
            "total_services" => $totalServices
        ],

        "recent_leads" => $recentLeads
    ]
]);

$conn->close();

?>