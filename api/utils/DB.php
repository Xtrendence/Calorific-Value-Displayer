<?php
	class DB {
		public $sqlite;
		public $file;

		public function __construct($file)
		{
			$this->file = $file;
		}

		public function connect() 
		{
			$this->sqlite = new SQLite3($this->file);
			$this->createTables();
			return $this->sqlite;
		}

		public function createTables() 
		{
			$this->sqlite->exec('
				CREATE TABLE IF NOT EXISTS Area (
					areaID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					area VARCHAR(32) NOT NULL UNIQUE
				)
			');

			$this->sqlite->exec('
				CREATE TABLE IF NOT EXISTS Value (
					valueID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					areaID INTEGER NOT NULL,
					applicableFor NOT NULL,
					FOREIGN KEY (areaID) REFERENCES Area(areaID) ON UPDATE CASCADE ON DELETE CASCADE
				)
			');
		}
	}
?>