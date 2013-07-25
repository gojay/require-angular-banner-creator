CREATE TABLE `phones` (
  `phone_id` int(11) unsigned NOT NULL auto_increment,
  `phone_name` varchar(255) NOT NULL,
  `phone_title` varchar(255) NOT NULL,
  `phone_image` varchar(255) default NULL,
  `phone_description` text NOT NULL,
  `phone_date` datetime NOT NULL,
  PRIMARY KEY  (`phone_id`),
  UNIQUE KEY `phone_id` (`phone_id`)
);

CREATE TABLE `phonemeta` (
  `meta_id` int(11) unsigned NOT NULL auto_increment,
  `phone_id` int(11) unsigned NOT NULL,
  `meta_name` varchar(255) NOT NULL,
  `meta_value` text NOT NULL,
  PRIMARY KEY  (`meta_id`,`meta_name`)
);

CREATE TABLE `images` (
  `image_id` int(11) unsigned NOT NULL auto_increment,
  `phone_id` int(11) unsigned NOT NULL,
  `image_name` varchar(255) NOT NULL,
  PRIMARY KEY  (`image_id`),
  UNIQUE KEY `image_id` (`image_id`),
  KEY `phone_id` (`phone_id`)
);