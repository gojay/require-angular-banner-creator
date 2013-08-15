-- phpMyAdmin SQL Dump
-- version 3.4.10.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Aug 01, 2013 at 03:27 AM
-- Server version: 5.5.31
-- PHP Version: 5.3.10

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `ch`
--

-- --------------------------------------------------------

--
-- Table structure for table `ch_apps`
--

CREATE TABLE IF NOT EXISTS `ch_apps` (
  `app_id` int(11) NOT NULL,
  `token` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `fields` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `ch_apps`
--

INSERT INTO `ch_apps` (`app_id`, `token`, `title`, `name`, `fields`) VALUES
(4607150, '9dc3dbcf0cbe4fb1adb28a887ade44bf', 'FB Campaign', 'fb', 'a:10:{i:0;i:35723048;i:1;i:35723049;i:2;i:35723051;i:3;i:35723052;i:4;i:35723071;i:5;i:35723053;i:6;i:37318243;i:7;i:35723068;i:8;i:35723070;i:9;i:35723072;}'),
(4617031, '859f6e91b6e944b8a15b45625d73e514', 'SEO Campaign', 'seo', ''),
(4582588, '94e83fac69174aabaa6a6cb40f2fd98a', 'Mobile App', 'mobile', ''),
(4762835, 'bf3f3bc13b5049cd8057f57db5bf47ff', 'Development App', 'development', ''),
(4675185, '8a19e0f6e64d40069ba537181e98346a', 'Mobile2', 'mobile2', '');

-- --------------------------------------------------------

--
-- Table structure for table `ch_app_fields`
--

CREATE TABLE IF NOT EXISTS `ch_app_fields` (
  `field_id` int(11) NOT NULL AUTO_INCREMENT,
  `app_id` int(11) NOT NULL,
  `field` varchar(255) NOT NULL,
  PRIMARY KEY (`field_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

--
-- Dumping data for table `ch_app_fields`
--

INSERT INTO `ch_app_fields` (`field_id`, `app_id`, `field`) VALUES
(1, 4762835, 'name'),
(2, 4762835, 'email'),
(3, 4762835, 'phone'),
(4, 4762835, 'fax'),
(5, 4762835, 'address'),
(6, 4762835, 'time-meeting'),
(7, 4762835, 'logo'),
(8, 4762835, 'category');

-- --------------------------------------------------------

--
-- Table structure for table `ch_creators`
--

CREATE TABLE IF NOT EXISTS `ch_creators` (
  `creator_id` mediumint(8) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` varchar(100) NOT NULL,
  PRIMARY KEY (`creator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `ch_creator_meta`
--

CREATE TABLE IF NOT EXISTS `ch_creator_meta` (
  `cmeta_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `creator_id` mediumint(9) NOT NULL,
  `meta_name` text NOT NULL,
  `meta_value` text NOT NULL,
  PRIMARY KEY (`cmeta_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `ch_users`
--

CREATE TABLE IF NOT EXISTS `ch_users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(100) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=24 ;

--
-- Dumping data for table `ch_users`
--

INSERT INTO `ch_users` (`user_id`, `name`, `username`, `password`, `role`) VALUES
(1, 'name', 'client1', '6143b3fe01b8fb782601106c0aa7388d', 'client'),
(2, 'Dodo', 'client2', 'ff77f98b59ceedadd9a2aa366c6c4b1c', 'client'),
(3, 'Roro', 'client3', 'ff77f98b59ceedadd9a2aa366c6c4b1c', 'client'),
(4, 'Citrusox Pte Ltd', 'citrusox', '8826cc7871b979abcacc2ace112787f3', 'client'),
(5, 'Mook.sg', 'mooksg', '476c571e2ae7d4f633e025fd169a8b28', 'client'),
(6, 'Liberty Insurance Singapore', 'liberty', '8b19e7abfd0f1e217a11a2d648af80fc', 'client'),
(7, 'Fuji Xerox', 'fuji', '17dea010b34ab6abc6d0456c33925e67', 'client'),
(8, 'Lynn Aesthetic', 'lynn', 'e9c4c3a28f5b1776ba4ea888c557b62c', 'client'),
(9, 'Marna', 'marna', 'e93b83f3c35c6e1b78c20bbb4fb9151f', 'client'),
(10, 'Citrusox Pte Ltd', 'citrusox', '8826cc7871b979abcacc2ace112787f3', 'client'),
(11, 'Marasil Singapore', 'marasil', '52bf207959f243eb865d3536cf9c94fe', 'client'),
(12, 'MDIS Pte Ltd', 'mdis', 'f59ca4669850548d333c3fc239067b2e', 'client'),
(13, 'Tan Chong Motor Sales', 'tan', '4d1063d73f84a4cc224d6a2adbd42ada', 'client'),
(14, 'Auto Saver Pte Ltd', 'auto', '592a2f3da7b525478fd56f5d2cc574a3', 'client'),
(15, 'Cannasia', 'cannasia', '64a836caa37708eea4d8e8cc23ccf6da', 'client'),
(16, 'NTU Alumni Club', 'ntu', 'df850a71e52c4e7455510ef2093fddff', 'client'),
(17, 'FlexiWerkz', 'flexiwerkz', 'f9207148b3be2976324c6fc27122ebfb', 'client'),
(18, 'Muthu''s Curry', 'muthus', '09c1b47dab917ec3c1f67fb893b5c406', 'client'),
(19, 'Activ-Works', 'activworks', 'a19f8f2929f4e931f863260fd5f00ad6', 'client'),
(20, 'CP Singapore', 'cp', '95fe25ed0d4044291d23c99a04094f51', 'client'),
(21, 'Snax! By CP', 'snax', 'c2c863bdfd08927e0f2128d9260ea8eb', 'client'),
(22, 'Contours Express', 'contours', '786c2e54f40abec652a8760e2b56a144', 'client'),
(23, 'Essential Parenting', 'essential', 'b6c382de88ff407ea76d9b379ce8eab0', 'client');

-- --------------------------------------------------------

--
-- Table structure for table `ch_user_meta`
--

CREATE TABLE IF NOT EXISTS `ch_user_meta` (
  `umeta_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `meta_key` varchar(255) NOT NULL,
  `meta_value` text NOT NULL,
  PRIMARY KEY (`umeta_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=11 ;

--
-- Dumping data for table `ch_user_meta`
--

INSERT INTO `ch_user_meta` (`umeta_id`, `user_id`, `meta_key`, `meta_value`) VALUES
(1, 1, 'company', 'Lorem Ipsum'),
(2, 1, 'email', 'lorem@ipsum.com'),
(3, 1, 'phone', '197865432'),
(4, 1, 'fax', '123456789'),
(5, 1, 'address', 'Silicon Valley, 99th'),
(6, 2, 'company', 'LoL'),
(7, 2, 'email', 'lolman@meme.com'),
(8, 2, 'phone', '0869312457'),
(9, 2, 'fax', '987654321'),
(10, 2, 'Address', 'Colorado, 69th');

-- --------------------------------------------------------

--
-- Table structure for table `ch_worksheets`
--

CREATE TABLE IF NOT EXISTS `ch_worksheets` (
  `worksheet_id` int(11) NOT NULL AUTO_INCREMENT,
  `app_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`worksheet_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=21 ;

--
-- Dumping data for table `ch_worksheets`
--

INSERT INTO `ch_worksheets` (`worksheet_id`, `app_id`, `user_id`) VALUES
(1, 4607150, 4),
(2, 4607150, 5),
(3, 4607150, 6),
(4, 4607150, 7),
(5, 4607150, 8),
(6, 4607150, 9),
(7, 4607150, 10),
(8, 4607150, 11),
(9, 4607150, 12),
(10, 4607150, 13),
(11, 4607150, 14),
(12, 4607150, 15),
(13, 4607150, 16),
(14, 4607150, 17),
(15, 4607150, 18),
(16, 4607150, 19),
(17, 4607150, 20),
(18, 4607150, 21),
(19, 4607150, 22),
(20, 4607150, 23);

-- --------------------------------------------------------

--
-- Table structure for table `ch_worksheet_meta`
--

CREATE TABLE IF NOT EXISTS `ch_worksheet_meta` (
  `meta_id` int(11) NOT NULL AUTO_INCREMENT,
  `worksheet_id` int(11) NOT NULL,
  `meta_key` varchar(255) NOT NULL,
  `meta_value` text NOT NULL,
  PRIMARY KEY (`meta_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=161 ;

--
-- Dumping data for table `ch_worksheet_meta`
--

INSERT INTO `ch_worksheet_meta` (`meta_id`, `worksheet_id`, `meta_key`, `meta_value`) VALUES
(1, 1, 'facebook', 'a:1:{i:0;s:33:"https://www.facebook.com/Citrusox";}'),
(2, 1, 'likes', 'a:1:{i:0;s:4:"1494";}'),
(3, 1, 'start_date', '2013-06-15'),
(4, 1, 'reporting_email', 'annalyn.seah@gmail.com; lena@citrusox.com'),
(5, 1, 'assigned', 'Dini'),
(6, 1, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(7, 1, 'budget', 'SGD 500.0000'),
(8, 1, 'white-label', 'Yes'),
(9, 2, 'facebook', 'a:1:{i:0;s:40:"https://www.facebook.com/mook.sg?fref=ts";}'),
(10, 2, 'likes', 'a:1:{i:0;s:2:"79";}'),
(11, 2, 'start_date', '2013-06-15'),
(12, 2, 'reporting_email', 'jamie@mckinnonprivate.com'),
(13, 2, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(14, 2, 'budget', 'SGD 500.0000'),
(15, 2, 'end_date', '2013-12-31'),
(16, 2, 'white-label', 'No'),
(17, 3, 'facebook', 'a:1:{i:0;s:51:"https://www.facebook.com/LibertyInsuranceSG?fref=ts";}'),
(18, 3, 'likes', 'a:1:{i:0;s:3:"747";}'),
(19, 3, 'start_date', '2013-06-08'),
(20, 3, 'reporting_email', 'sarah-marie-teo@tateanzur.com'),
(21, 3, 'fans', 'a:1:{i:0;s:5:"2,000";}'),
(22, 3, 'budget', 'SGD 1000.0000'),
(23, 3, 'end_date', '2013-11-30'),
(24, 3, 'white-label', 'Yes'),
(25, 4, 'facebook', 'a:1:{i:0;s:51:"https://www.facebook.com/FujiXeroxSingapore?fref=ts";}'),
(26, 4, 'likes', 'a:1:{i:0;s:3:"885";}'),
(27, 4, 'start_date', '2013-06-01'),
(28, 4, 'reporting_email', 'leeren.koh@ssp.fujixerox.com'),
(29, 4, 'fans', 'a:1:{i:0;s:5:"3,000";}'),
(30, 4, 'budget', 'SGD 1500.0000'),
(31, 4, 'end_date', '2013-11-30'),
(32, 4, 'white-label', 'No'),
(33, 5, 'facebook', 'a:1:{i:0;s:53:"https://www.facebook.com/LynnAesthetic?ref=ts&fref=ts";}'),
(34, 5, 'likes', 'a:1:{i:0;s:2:"49";}'),
(35, 5, 'start_date', '2013-06-01'),
(36, 5, 'reporting_email', 'alfred@lynnaesthetic.com.sg'),
(37, 5, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(38, 5, 'budget', 'SGD 500.0000'),
(39, 5, 'end_date', '2013-11-30'),
(40, 5, 'white-label', 'No'),
(41, 6, 'facebook', 'a:1:{i:0;s:41:"https://www.facebook.com/marna.sg?fref=ts";}'),
(42, 6, 'likes', 'a:1:{i:0;s:1:"0";}'),
(43, 6, 'start_date', '2013-05-15'),
(44, 6, 'reporting_email', 's@gabrielshawn.com'),
(45, 6, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(46, 6, 'budget', 'SGD 650.0000'),
(47, 6, 'end_date', '2013-11-15'),
(48, 6, 'white-label', 'Yes'),
(49, 7, 'facebook', 'a:1:{i:0;s:41:"https://www.facebook.com/Citrusox?fref=ts";}'),
(50, 7, 'likes', 'a:1:{i:0;s:3:"849";}'),
(51, 7, 'start_date', '2013-05-15'),
(52, 7, 'reporting_email', 'lena@citrusox.com'),
(53, 7, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(54, 7, 'budget', 'SGD 650.0000'),
(55, 7, 'end_date', '2013-11-15'),
(56, 7, 'white-label', 'No'),
(57, 8, 'facebook', 'a:1:{i:0;s:43:"https://www.facebook.com/Marasil.sg?fref=ts";}'),
(58, 8, 'likes', 'a:1:{i:0;s:1:"0";}'),
(59, 8, 'start_date', '2013-05-01'),
(60, 8, 'reporting_email', 'colinykpang@hotmail.com'),
(61, 8, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(62, 8, 'budget', 'SGD 650.0000'),
(63, 8, 'end_date', '2013-10-31'),
(64, 8, 'white-label', 'No'),
(65, 9, 'facebook', 'a:1:{i:0;s:40:"https://www.facebook.com/mdis.sg?fref=ts";}'),
(66, 9, 'likes', 'a:1:{i:0;s:5:"97920";}'),
(67, 9, 'start_date', '2013-04-15'),
(68, 9, 'reporting_email', 'carrie_chulh@mdis.edu.sg'),
(69, 9, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(70, 9, 'budget', 'SGD 650.0000'),
(71, 9, 'end_date', '2013-10-15'),
(72, 9, 'white-label', 'No'),
(73, 10, 'facebook', 'a:1:{i:0;s:85:"https://www.facebook.com/pages/Nissan-Tan-Chong-Motor-Kuantan/154324491248854?fref=ts";}'),
(74, 10, 'likes', 'a:1:{i:0;s:4:"7381";}'),
(75, 10, 'start_date', '2013-04-12'),
(76, 10, 'reporting_email', 'penny_liew@tanchong.com'),
(77, 10, 'fans', 'a:1:{i:0;s:5:"3,000";}'),
(78, 10, 'budget', 'SGD 1950.0000'),
(79, 10, 'end_date', '2013-09-30'),
(80, 10, 'white-label', 'No'),
(81, 11, 'facebook', 'a:1:{i:0;s:44:"https://www.facebook.com/AutosaverSG?fref=ts";}'),
(82, 11, 'likes', 'a:1:{i:0;s:3:"149";}'),
(83, 11, 'start_date', '2013-03-01'),
(84, 11, 'reporting_email', 'bobby@autosaver.com.sg'),
(85, 11, 'fans', 'a:1:{i:0;s:5:"3,000";}'),
(86, 11, 'budget', 'SGD 1950.0000'),
(87, 11, 'end_date', '2013-08-31'),
(88, 11, 'white-label', 'Yes'),
(89, 12, 'facebook', 'a:1:{i:0;s:44:"https://www.facebook.com/CANNASIA.SG?fref=ts";}'),
(90, 12, 'likes', 'a:1:{i:0;s:3:"171";}'),
(91, 12, 'start_date', '2013-03-01'),
(92, 12, 'reporting_email', 'cannasia@cannasia.com'),
(93, 12, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(94, 12, 'budget', 'SGD 650.0000'),
(95, 12, 'end_date', '2013-08-31'),
(96, 12, 'white-label', 'No'),
(97, 13, 'facebook', 'a:1:{i:0;s:44:"https://www.facebook.com/NTUACEVENTS?fref=ts";}'),
(98, 13, 'likes', 'a:1:{i:0;s:3:"133";}'),
(99, 13, 'start_date', '2013-02-26'),
(100, 13, 'reporting_email', 'grace@ntualumni.org.sg'),
(101, 13, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(102, 13, 'budget', 'SGD 650.0000'),
(103, 13, 'end_date', '2013-08-15'),
(104, 13, 'white-label', 'No'),
(105, 14, 'facebook', 'a:1:{i:0;s:43:"https://www.facebook.com/Flexiwerkz?fref=ts";}'),
(106, 14, 'likes', 'a:1:{i:0;s:4:"2301";}'),
(107, 14, 'start_date', '2013-02-15'),
(108, 14, 'reporting_email', 'lorraine@flexiwerkz.com'),
(109, 14, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(110, 14, 'budget', 'SGD 650.0000'),
(111, 14, 'end_date', '2013-08-15'),
(112, 14, 'white-label', 'No'),
(113, 15, 'facebook', 'a:1:{i:0;s:44:"https://www.facebook.com/muthuscurry?fref=ts";}'),
(114, 15, 'likes', 'a:1:{i:0;s:4:"1923";}'),
(115, 15, 'start_date', '2013-02-15'),
(116, 15, 'reporting_email', 'veshali@muthuscurrinary.com'),
(117, 15, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(118, 15, 'budget', 'SGD 650.0000'),
(119, 15, 'end_date', '2013-08-15'),
(120, 15, 'white-label', 'No'),
(121, 16, 'facebook', 'a:1:{i:0;s:43:"https://www.facebook.com/ActivWorks?fref=ts";}'),
(122, 16, 'likes', 'a:1:{i:0;s:1:"0";}'),
(123, 16, 'start_date', '2013-01-15'),
(124, 16, 'reporting_email', 'ng.chuntian@activ-works.com.sg'),
(125, 16, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(126, 16, 'budget', 'SGD 650.0000'),
(127, 16, 'end_date', '2013-07-15'),
(128, 16, 'white-label', 'No'),
(129, 17, 'facebook', 'a:1:{i:0;s:44:"https://www.facebook.com/CPSingapore?fref=ts";}'),
(130, 17, 'likes', 'a:1:{i:0;s:3:"223";}'),
(131, 17, 'start_date', '2013-01-15'),
(132, 17, 'reporting_email', 'shaminlaw@cpisgp.com.sg'),
(133, 17, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(134, 17, 'budget', 'SGD 975.0000'),
(135, 17, 'end_date', '2013-07-15'),
(136, 17, 'white-label', 'No'),
(137, 18, 'facebook', 'a:1:{i:0;s:41:"https://www.facebook.com/SnaxByCP?fref=ts";}'),
(138, 18, 'likes', 'a:1:{i:0;s:3:"530";}'),
(139, 18, 'start_date', '2013-01-15'),
(140, 18, 'reporting_email', 'shaminlaw@cpisgp.com.sg'),
(141, 18, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(142, 18, 'budget', 'SGD 975.0000'),
(143, 18, 'end_date', '2013-07-15'),
(144, 18, 'white-label', 'No'),
(145, 19, 'facebook', 'a:1:{i:0;s:51:"https://www.facebook.com/contoursexpress.sg?fref=ts";}'),
(146, 19, 'likes', 'a:1:{i:0;s:4:"2139";}'),
(147, 19, 'start_date', '2013-01-15'),
(148, 19, 'reporting_email', 'adeline@contoursexpress.com.sg'),
(149, 19, 'fans', 'a:1:{i:0;s:5:"1,000";}'),
(150, 19, 'budget', 'SGD 650.0000'),
(151, 19, 'end_date', '2013-07-15'),
(152, 19, 'white-label', 'No'),
(153, 20, 'facebook', 'a:1:{i:0;s:54:"https://www.facebook.com/EssentialParenting.sg?fref=ts";}'),
(154, 20, 'likes', 'a:1:{i:0;s:3:"725";}'),
(155, 20, 'start_date', '2013-01-01'),
(156, 20, 'reporting_email', 'eunice_sui@msf.gov.sg'),
(157, 20, 'fans', 'a:1:{i:0;s:5:"3,000";}'),
(158, 20, 'budget', 'SGD 2600.0000'),
(159, 20, 'end_date', '2013-12-31'),
(160, 20, 'white-label', 'No');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
