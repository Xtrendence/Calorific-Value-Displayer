<?php
	class CalorificValue 
	{
		public $applicableFor;
		public $value;
		public $area;

		public function __construct($applicableFor, $value, $area) 
		{
			$this->applicableFor = $applicableFor;
			$this->value = $value;
			$this->area = $area;
		}
	}
?>