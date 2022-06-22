<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "GET") 
	{
		include_once("../utils/DataFetch.php");

		$from = isset($_GET["from"]) ? $_GET["from"] : date("Y") . "-01-01T00:00:00";
		$to = isset($_GET["to"]) ? $_GET["to"] : gmdate("Y-m-d\TH:i:s\Z");

		$fetcher = new DataFetch(date("Y") . "-01-01T00:00:00", gmdate("Y-m-d\TH:i:s\Z"));
		$csv = $fetcher->fetch();
		$parsed = $fetcher->parse($csv);
		$fetcher->store($parsed);

		echo json_encode($fetcher->fetchFromDBByDate($from, $to), JSON_PRETTY_PRINT);
	}
?>