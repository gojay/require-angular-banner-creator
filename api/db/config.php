<?php
// Config NotORM 
$dsn      = "mysql:dbname=db_phonecat;host=localhost";
$username = "root";
$password = "";
$pdo = new PDO($dsn, $username, $password);
$db  = new NotORM($pdo, new NotORM_Structure_Convention(
    $primary = "%s_id", // $table_id
    $foreign = "%s_id", // $table_id
    $table   = "%ss" 	// {$table}s
));