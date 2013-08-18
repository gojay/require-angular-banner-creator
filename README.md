Require Angular Banner Creator v.2.1
==============================

Banner creator built by [AngularJS](https://www.angularjs.org) &amp; [RequireJS](https://www.requirejs.org) with resource to save template configuration

Features
------
1. URL Hashbang mode, with "!" prefix in URL
2. Adding a fixed header (adjust to the panels)
3. Save the template configuration and show the list for the edited (for the while only conversation module)

How to Use
------

1. Clone this repository ( _Recomended_ ), then switch to branch v.2.1_resource

 ```
 // clone repo, or pull this repo (if have already clone this old repo)
git clone git@github.com:gojay/require-angular-banner-creator.git

// change to repository directory
cd require-angular-banner-creator

// switch to branch v.2.1_resource
git checkout v.2.1_resource

 ```

2. Change your absolute URL at config.php

 ```php
define('ABS_URL', 'http://example.com');
 ```

3. Create MySQL DB, dumping the SQL in api/db/sql.sql .Then Set your DB configuration at config.php

 ```php
// DB Config
$db_config = array(
	'host'     => 'localhost',
	'username' => 'root',
	'password' => '',
	'dbname'   => 'ch',
);
 ```

4. Refresh your project

```
// if you wanna back to version 2.0, just simply
git checkout master

// then refresh your project again

```