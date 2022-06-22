<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "DELETE") 
	{
		$input = json_decode(file_get_contents("php://input"), true);

		include_once("../utils/DB.php");

		$db = new DB("../db/db.sqlite");
		$connection = $db->connect();

		$statement = $connection->prepare('DELETE FROM [Value] WHERE valueID=:id');
		$statement->bindParam(":id", $input["id"]);
		$result = $statement->execute();
	}
?>