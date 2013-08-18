-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Inang: localhost
-- Waktu pembuatan: 11 Agu 2013 pada 18.08
-- Versi Server: 5.6.12-log
-- Versi PHP: 5.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Basis data: `ch`
--
CREATE DATABASE IF NOT EXISTS `ch` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `ch`;

-- --------------------------------------------------------

--
-- Struktur dari tabel `ch_apps`
--

CREATE TABLE IF NOT EXISTS `ch_apps` (
  `app_id` int(11) NOT NULL,
  `token` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data untuk tabel `ch_apps`
--

INSERT INTO `ch_apps` (`app_id`, `token`, `title`, `name`) VALUES
(4607150, '9dc3dbcf0cbe4fb1adb28a887ade44bf', 'FB Campaign', 'fb'),
(4617031, '859f6e91b6e944b8a15b45625d73e514', 'SEO Campaign', 'seo'),
(4582588, '94e83fac69174aabaa6a6cb40f2fd98a', 'Mobile App', 'mobile'),
(4762835, 'bf3f3bc13b5049cd8057f57db5bf47ff', 'Development App', 'development'),
(4675185, '8a19e0f6e64d40069ba537181e98346a', 'Mobile2', 'mobile2');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ch_app_fields`
--

CREATE TABLE IF NOT EXISTS `ch_app_fields` (
  `field_id` int(11) NOT NULL AUTO_INCREMENT,
  `app_id` int(11) NOT NULL,
  `field` varchar(255) NOT NULL,
  PRIMARY KEY (`field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `ch_users`
--

CREATE TABLE IF NOT EXISTS `ch_users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(100) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

--
-- Dumping data untuk tabel `ch_users`
--

INSERT INTO `ch_users` (`user_id`, `name`, `username`, `password`, `role`) VALUES
(1, 'Administrator', 'admin', '51e6979a8c14d22ae55f3aabd893a37e', 'admin'),
(2, 'Sally', 'sally', '6143b3fe01b8fb782601106c0aa7388d', 'supervisor'),
(3, 'Joe', 'joe', '6143b3fe01b8fb782601106c0aa7388d', 'operation'),
(4, 'Google', 'google', '6143b3fe01b8fb782601106c0aa7388d', 'client'),
(5, 'Apple', 'apple', '6143b3fe01b8fb782601106c0aa7388d', 'client');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ch_user_meta`
--

CREATE TABLE IF NOT EXISTS `ch_user_meta` (
  `umeta_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `meta_key` varchar(255) NOT NULL,
  `meta_value` text NOT NULL,
  PRIMARY KEY (`umeta_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

--
-- Dumping data untuk tabel `ch_user_meta`
--

INSERT INTO `ch_user_meta` (`umeta_id`, `user_id`, `meta_key`, `meta_value`) VALUES
(1, 4, 'email', 'play@google.com'),
(2, 4, 'phone', '0987654321'),
(3, 4, 'fax', '123456789'),
(4, 4, 'address', 'Silicon Valley, 99th'),
(5, 5, 'email', 'app@apple.com'),
(6, 5, 'phone', '0123456789'),
(7, 5, 'fax', '987654321'),
(8, 5, 'address', 'Silicon Valley, 66th');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ch_worksheets`
--

CREATE TABLE IF NOT EXISTS `ch_worksheets` (
  `worksheet_id` int(11) NOT NULL AUTO_INCREMENT,
  `app_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`worksheet_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data untuk tabel `ch_worksheets`
--

INSERT INTO `ch_worksheets` (`worksheet_id`, `app_id`, `user_id`) VALUES
(1, 4762835, 4);

-- --------------------------------------------------------

--
-- Struktur dari tabel `ch_worksheet_meta`
--

CREATE TABLE IF NOT EXISTS `ch_worksheet_meta` (
  `meta_id` int(11) NOT NULL AUTO_INCREMENT,
  `worksheet_id` int(11) NOT NULL,
  `meta_key` varchar(255) NOT NULL,
  `meta_value` text NOT NULL,
  PRIMARY KEY (`meta_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `creators`
--

CREATE TABLE IF NOT EXISTS `creators` (
  `creator_id` bigint(9) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `image` text,
  `description` text NOT NULL,
  `autosave` tinyint(1) NOT NULL,
  PRIMARY KEY (`creator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data untuk tabel `creators`
--

INSERT INTO `creators` (`creator_id`, `title`, `type`, `image`, `description`, `autosave`) VALUES
(1375825729198, 'HTML5 blue', 'conversation', 'http://dev.angularjs/_learn_/require-angular-banner-creator/images/upload/1375825729198/conversation_tpl.jpg', 'Cover HTML5 template 1', 0),
(1375826115731, 'HTML5 white', 'conversation', 'http://dev.angularjs/_learn_/require-angular-banner-creator/images/upload/1375826115731/conversation_tpl.jpg', 'Cover HTML5 template 2', 0),
(1375826998599, 'HTML5 blue 2', 'conversation', 'http://dev.angularjs/_learn_/require-angular-banner-creator/images/upload/1375826998599/conversation_tpl.jpg', 'Cover HTML5 blue template 3', 0),
(1375827178614, 'HTML5 white 2', 'conversation', 'http://dev.angularjs/_learn_/require-angular-banner-creator/images/upload/1375827178614/conversation_tpl.jpg', 'Cover HTML5 white template 4', 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `creator_meta`
--

CREATE TABLE IF NOT EXISTS `creator_meta` (
  `cmeta_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `creator_id` bigint(9) NOT NULL,
  `meta_key` varchar(255) NOT NULL,
  `meta_value` text NOT NULL,
  PRIMARY KEY (`cmeta_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=73 ;

--
-- Dumping data untuk tabel `creator_meta`
--

INSERT INTO `creator_meta` (`cmeta_id`, `creator_id`, `meta_key`, `meta_value`) VALUES
(49, 1375825729198, 'logo', 'a:5:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:8:"position";a:2:{s:1:"x";i:18;s:1:"y";i:78;}s:8:"uploaded";b:1;s:5:"image";s:36:"images/upload/1375825729198/logo.png";}'),
(50, 1375825729198, 'spot1', 'a:6:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:4:"clip";s:6:"circle";s:8:"position";a:2:{s:1:"x";i:65;s:1:"y";i:266;}s:8:"uploaded";b:1;s:5:"image";s:37:"images/upload/1375825729198/spot1.png";}'),
(51, 1375825729198, 'spot2', 'a:6:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:4:"clip";s:6:"circle";s:8:"position";a:2:{s:1:"x";i:258;s:1:"y";i:266;}s:8:"uploaded";b:1;s:5:"image";s:37:"images/upload/1375825729198/spot2.png";}'),
(52, 1375825729198, 'align', 'a:2:{s:1:"x";s:2:"x1";s:1:"y";s:2:"y1";}'),
(53, 1375825729198, 'queue', 'a:3:{s:5:"empty";b:1;s:5:"count";i:0;s:8:"finished";i:0;}'),
(54, 1375825729198, 'selected', '0'),
(55, 1375826115731, 'logo', 'a:5:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:8:"position";a:2:{s:1:"x";i:18;s:1:"y";i:78;}s:8:"uploaded";b:1;s:5:"image";s:36:"images/upload/1375826115731/logo.png";}'),
(56, 1375826115731, 'spot1', 'a:6:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:4:"clip";s:6:"circle";s:8:"position";a:2:{s:1:"x";i:65;s:1:"y";i:266;}s:8:"uploaded";b:1;s:5:"image";s:37:"images/upload/1375826115731/spot1.png";}'),
(57, 1375826115731, 'spot2', 'a:6:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:4:"clip";s:6:"circle";s:8:"position";a:2:{s:1:"x";i:266;s:1:"y";i:266;}s:8:"uploaded";b:1;s:5:"image";s:2751:"data:image/jpeg;base64,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";}'),
(58, 1375826115731, 'align', 'a:2:{s:1:"x";s:4:"none";s:1:"y";s:4:"none";}'),
(59, 1375826115731, 'queue', 'a:3:{s:5:"empty";b:1;s:5:"count";i:0;s:8:"finished";i:0;}'),
(60, 1375826115731, 'selected', '1'),
(61, 1375826998599, 'logo', 'a:5:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:8:"position";a:2:{s:1:"x";i:211;s:1:"y";i:68;}s:8:"uploaded";b:1;s:5:"image";s:36:"images/upload/1375826998599/logo.png";}'),
(62, 1375826998599, 'spot1', 'a:6:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:4:"clip";s:6:"circle";s:8:"position";a:2:{s:1:"x";i:14;s:1:"y";i:289;}s:8:"uploaded";b:1;s:5:"image";s:37:"images/upload/1375826998599/spot1.png";}'),
(63, 1375826998599, 'spot2', 'a:6:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:4:"clip";s:6:"circle";s:8:"position";a:2:{s:1:"x";s:3:"309";s:1:"y";s:3:"289";}s:8:"uploaded";b:1;s:5:"image";s:37:"images/upload/1375826998599/spot2.png";}'),
(64, 1375826998599, 'align', 'a:2:{s:1:"x";s:2:"x1";s:1:"y";s:2:"y1";}'),
(65, 1375826998599, 'queue', 'a:3:{s:5:"empty";b:1;s:5:"count";i:0;s:8:"finished";i:0;}'),
(66, 1375826998599, 'selected', '2'),
(67, 1375827178614, 'logo', 'a:5:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:8:"position";a:2:{s:1:"x";i:211;s:1:"y";i:67;}s:8:"uploaded";b:1;s:5:"image";s:36:"images/upload/1375827178614/logo.png";}'),
(68, 1375827178614, 'spot1', 'a:6:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:4:"clip";s:6:"circle";s:8:"position";a:2:{s:1:"x";i:65;s:1:"y";i:266;}s:8:"uploaded";b:1;s:5:"image";s:2751:"data:image/jpeg;base64,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";}'),
(69, 1375827178614, 'spot2', 'a:6:{s:4:"hide";b:0;s:11:"placeholder";b:1;s:4:"clip";s:6:"circle";s:8:"position";a:2:{s:1:"x";i:258;s:1:"y";i:266;}s:8:"uploaded";b:1;s:5:"image";s:3223:"data:image/jpeg;base64,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";}'),
(70, 1375827178614, 'align', 'a:2:{s:1:"x";s:2:"x1";s:1:"y";s:2:"y1";}'),
(71, 1375827178614, 'queue', 'a:3:{s:5:"empty";b:1;s:5:"count";i:0;s:8:"finished";i:0;}'),
(72, 1375827178614, 'selected', '3');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
