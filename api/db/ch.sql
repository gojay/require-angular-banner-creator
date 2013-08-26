-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Inang: localhost
-- Waktu pembuatan: 26 Agu 2013 pada 16.44
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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=25 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
