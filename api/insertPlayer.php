<?php

require '../files/conexion.php';
//header('Content-Type: application/json'); 
$response = new stdClass();

$nom = $_POST['nombre'];
$tiempo = $_POST['timer'];
$gano = $_POST['gano'];
$query = "INSERT INTO jugadores VALUES (NULL, '$nom', '00:$tiempo', $gano)";
//$query = "INSERT INTO jugadores VALUES (NULL, '$', '$', b'$')";
//echo $msgCon; echo $query;
$res = $con->query($query);
if ($res) {
    $response->state = true;
} else {
    $response->state = false;
    $response->detail = "Error al agregar";
    error_log("Error en consulta SQL: " . $con->error); 
}
echo json_encode($response);
exit;