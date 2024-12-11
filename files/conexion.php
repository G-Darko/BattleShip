<?php  
	//crear variables conexion
	$servername="localhost";
	$bd="battle";
	$username="root";
	$password="";

	$response = new stdClass();
	error_reporting(E_ALL); //ocultar o mostrar los errores 
	//crear la conexion

	$con=mysqli_connect($servername,$username,$password,$bd);
	$msgCon="";
	//validar nuestra conexion.
	if (!$con) {
		$msgCon= die("Conexion Fallida.." . mysqli_connect_error ());
	}
	else {
		$msgCon= "Se conecto correctamente la base de datos";
	}
	//echo $msgCon;