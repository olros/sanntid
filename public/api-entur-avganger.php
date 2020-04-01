<?php
header('Content-Type: application/json');
header('Content-Type: text/html; charset=utf-8');
$service_url = 'https://api.entur.io/journey-planner/v2/graphql';

$curl = curl_init($service_url);

$id = $_GET['id'];
$antall = $_GET['antall'];

// $curl_post_data = array("query" => '{stopPlace(id: "NSR:StopPlace:' . $id . '") {id name latitude longitude estimatedCalls(timeRange: 86400, numberOfDepartures: ' . $antall . ', omitNonBoarding:true) {realtime aimedDepartureTime expectedDepartureTime destinationDisplay {frontText} serviceJourney {id operator {id} journeyPattern {line {publicCode id transportMode}}}}}}');
$curl_post_data = array("query" => '{stopPlace(id: "NSR:StopPlace:' . $id . '") {id name estimatedCalls(timeRange: 86400, numberOfDepartures: ' . $antall . ', omitNonBoarding:true) {realtime expectedDepartureTime destinationDisplay {frontText} serviceJourney {journeyPattern {line {publicCode id}}}}}}');
$data_string =  json_encode($curl_post_data);
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($curl, CURLOPT_POSTFIELDS, $data_string);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'ET-Client-Name: Sanntid - https://sanntid.ga')
);

$curl_response = curl_exec($curl);
if ($curl_response === false) {
    $info = curl_getinfo($curl);
    curl_close($curl);
    die('error occured during curl exec. Additioanl info: ' . var_export($info));
}
curl_close($curl);
echo $curl_response;

?>