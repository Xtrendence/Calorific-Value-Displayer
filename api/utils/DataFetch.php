<?php
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

		public function parse($csv) 
		{
			include_once("../models/CalorificValue.php");

			$data = [];

			$lines = explode("\n", $csv);
			array_shift($lines);

			foreach($lines as $line) {
				$parts = explode('","', $line);
				$applicableFor = $parts[1];
				$dataItem = $parts[2];
				$value = $parts[3];
				$area = str_replace("Calorific Value, ", "", $dataItem);

				array_push($data, new CalorificValue($applicableFor, $value, $area));
			}

			return $data;
		}

		public function store($data) 
		{

		}
	}
?>