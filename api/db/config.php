<?php
// Config NotORM 
$dsn      = sprintf("mysql:dbname=%s;host=%s", $db_config['dbname'], $db_config['host']);
$username = "root";
$password = "";
$pdo = new PDO($dsn, $db_config['username'], $db_config['password']);
$db  = new NotORM($pdo, new NotORM_Structure_Convention(
    $primary = "%s_id", // $table_id
    $foreign = "%s_id",  // $table_id
    $table   = "%ss"	// {$table}s
));