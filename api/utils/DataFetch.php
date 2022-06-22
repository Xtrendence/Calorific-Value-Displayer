<?php
	include_once("../utils/DB.php");
	include_once("../models/CalorificValue.php");

	class DataFetch 
	{
		private $dateFrom;
		private $dateTo;

		public function __construct($dateFrom, $dateTo)
		{
			$this->dateFrom = $dateFrom;
			$this->dateTo = $dateTo;
		}

		public function fetch()
		{
			$testing = true;

			if($testing && file_exists("./data.csv") && !empty(file_get_contents("./data.csv"))) 
			{
				return file_get_contents("./data.csv");
			}

			$form_data = http_build_query(
				array(
					"LatestValue" => "value",
					"PublicationObjectIds" => "408:28, 408:5328, 408:5320, 408:5291, 408:5366, 408:5312, 408:5346, 408:5324, 408:5316, 408:5308, 408:5336, 408:5333, 408:5342, 408:5354, 408:82, 408:70, 408:59, 408:38, 408:49",
					"Applicable" => "ApplicableFor",
					"FromUtcDatetime" => $this->dateFrom,
					"ToUtcDateTime" => $this->dateTo,
					"FileType" => "Csv"
				)
			);

			$options = array("http" =>
				array(
					"method" => "POST",
					"header" => "Content-type: application/x-www-form-urlencoded",
					"content" => $form_data
				)
			);

			$context = stream_context_create($options);

			$result = file_get_contents("http://mip-prd-web.azurewebsites.net/DataItemViewer/DownloadFile", false, $context);

			if($testing)
			{
				file_put_contents("./data.csv", $result);
			}

			return $result;
		}

		public function fetchFromDB($rangeFrom, $rangeTo)
		{
			$db = new DB("../db/db.sqlite");
			$connection = $db->connect();

			$statement = $connection->prepare('SELECT [Value].valueID, [Value].areaID, [Value].applicableFor, [Value].calorificValue, Area.area FROM [Value] LEFT JOIN Area ON Area.areaID = [Value].areaID WHERE [Value].valueID BETWEEN :rangeFrom AND :rangeTo LIMIT 100');
			$statement->bindParam(":rangeFrom", $rangeFrom);
			$statement->bindParam(":rangeTo", $rangeTo);
			$result = $statement->execute();

			$rows = [];

			while($row = $result->fetchArray(SQLITE3_ASSOC)) 
			{
				array_push($rows, $row);
			}

			return $rows;
		}

		public function parse($csv) 
		{
			$data = [];

			$lines = explode("\n", $csv);
			array_shift($lines);

			foreach($lines as $line) {
				try 
				{
					$parts = explode('","', $line);
					$applicableFor = $parts[1];
					$dataItem = $parts[2];
					$value = $parts[3];
					$area = str_replace("Calorific Value, ", "", $dataItem);

					array_push($data, new CalorificValue($applicableFor, $value, $area));
				} 
				catch(Exception $e) 
				{
					continue;
				}
			}

			return $data;
		}

		public function store($rows) 
		{
			$db = new DB("../db/db.sqlite");
			$connection = $db->connect();

			for($i = 0; $i < count($rows); $i++)
			{
				$row = (array) $rows[$i];

				$area = $row["area"];
				$applicableFor = $row["applicableFor"];
				$calorificValue = $row["value"];

				if(!empty($area))
				{
					$statement = $connection->prepare('INSERT INTO Area (area) VALUES (:area)');
					$statement->bindParam(":area", $row["area"]);
					$statement->execute();

					$statement = $connection->prepare('SELECT areaID FROM Area WHERE area=:area');
					$statement->bindParam(":area", $row["area"]);
					$result = $statement->execute();
					$areaID = $result->fetchArray()[0];

					$statement = $connection->prepare('SELECT valueID FROM [Value] WHERE areaID=:areaID AND applicableFor=:applicableFor AND calorificValue=:calorificValue');
					$statement->bindParam(":areaID", $areaID);
					$statement->bindParam(":applicableFor", $applicableFor);
					$statement->bindParam(":calorificValue", $calorificValue);
					$result = $statement->execute();
					
					if(empty($result->fetchArray()))
					{
						$statement = $connection->prepare('INSERT INTO [Value] (areaID, applicableFor, calorificValue) VALUES (:areaID, :applicableFor, :calorificValue)');
						$statement->bindParam(":areaID", $areaID);
						$statement->bindParam(":applicableFor", $applicableFor);
						$statement->bindParam(":calorificValue", $calorificValue);
						$statement->execute();
					}
				}
			}
		}
	}
?>