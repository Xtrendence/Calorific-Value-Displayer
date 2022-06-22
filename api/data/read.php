<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "GET") 
	{
		include_once("../utils/DataFetch.php");

		$fetcher = new DataFetch(date("Y") . "-01-01T00:00:00", gmdate("Y-m-d\TH:i:s\Z"));
		$csv = $fetcher->fetch();
		$parsed = $fetcher->parse($csv);
		$fetcher->store($parsed);

		// echo json_encode($parsed, JSON_PRETTY_PRINT);
	}
?>