Require Angular Banner Creator v.2.1
==============================

Banner creator built by [AngularJS](https://www.angularjs.org) &amp; [RequireJS](https://www.requirejs.org) with resource to save template configuration

Features
------
1. URL Hashbang mode, with "!" as prefix
2. Adding a fixed header (adjust to the panels)
3. Save the template configuration (banner & conversation modules)

Installation
------

1. Clone this repository ( _Recomended_ ), then switch to branch **v.2.1resource**

 ```
 // clone this repo
git clone git@github.com:gojay/require-angular-banner-creator.git
 // if have already clone this old repo, pull (fetch n synchronize) this repo
git pull

 // view branch (both local and remote branches)
git branch -a
 // switch to branch v.2.1_resource
git checkout -b v.2.1_resource origin/v.2.1_resource
 ```

2. Change your absolute URL at config.php

 ```php
define('ABS_URL', 'http://example.com');
 ```

3. Create MySQL DB, the dump SQL file at [REPO]/api/db/ch.sql (maybe before you dumping these SQL, change your abs URL in table creators at line 170). Set your DB configuration at config.php

 ```php
// DB Config
$db_config = array(
	'host'     => 'localhost',
	'username' => 'root',
	'password' => '',
	'dbname'   => 'ch',
);
 ```

4. Refresh your project (clear your browser cache if nothing changes)

```
// if you wanna back to version 2.0, just simply
git checkout master

// then refresh your project again

```

Some Configuration / Fix the Errors
------------

Go to folder api/vendor/vrana/. if folder **notorm** doesn't exists, create folder notorm. Copy all files/folder in _notorm, then paste in folder **notorm**

Test **API** this application, go to http://[YOUR_APPLICATION]/api. If you see the **Slim 404**, the application is ready to run.

if an occured PHP error, check your php version (> 5.3.2) for supporting PHP namespace. If still errors, follow the steps below : 

- Delete folder vendor
- Delete composer.lock and composer.phar
- Read file at api/readme.md and follow the steps