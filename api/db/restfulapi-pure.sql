-- phpMyAdmin SQL Dump
-- version 5.0.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 22, 2020 at 08:00 PM
-- Server version: 10.4.14-MariaDB
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE SCHEMA IF NOT EXISTS restfulapi DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;
USE restfulapi;

-- --------------------------------------------------------
--
-- Table structure for table `groups`
--

CREATE TABLE IF NOT EXISTS `user_groups` (
  `id` int NOT NULL,
  `title` varchar(45) NOT NULL,
  CONSTRAINT PK_user_groups__id PRIMARY KEY (id),
  CONSTRAINT UK_user_groups__group UNIQUE(title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------
--
-- Table structure for table `rights`
--

CREATE TABLE IF NOT EXISTS `rights` (
  `id` int NOT NULL,
  `title` varchar(45) NOT NULL,
  CONSTRAINT PK_rights__id PRIMARY KEY (id),
  CONSTRAINT UK_rights__right UNIQUE (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------
--
-- Table structure for table `classes`
--

CREATE TABLE IF NOT EXISTS `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class` int NOT NULL,
  CONSTRAINT PK_classes__id PRIMARY KEY (id),
  CONSTRAINT UK_classes__class UNIQUE (class)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------
--
-- Table structure for table `class_branches`
--

CREATE TABLE IF NOT EXISTS `class_branches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_branch` varchar(1) NOT NULL,
  CONSTRAINT PK_class_branches__id PRIMARY KEY (id),
  CONSTRAINT UK_class_branches__class UNIQUE (class)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------
--
-- Table structure for table `students_bind_classes`
--

CREATE TABLE IF NOT EXISTS `students_bind_classes` (
  `student_id` int NOT NULL,
  `class` int NOT NULL,
  `class_branch` int NOT NULL,
  CONSTRAINT PK_class_branches__id PRIMARY KEY (id),
  CONSTRAINT FK_students_bind_classes__student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT FK_students_bind_classes__class FOREIGN KEY (class) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT FK_students_bind_classes__class_branch FOREIGN KEY (class_branch) REFERENCES class_branches(id) ON DELETE CASCADE,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------
--
-- Table structure for table `group_rights`
--

CREATE TABLE IF NOT EXISTS `group_rights` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `right_id` int NOT NULL,
  CONSTRAINT PK_group_rights__id PRIMARY KEY (id),
  CONSTRAINT FK_group_rights__group_id FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
  CONSTRAINT FK_group_rights__right_id FOREIGN KEY (right_id) REFERENCES rights(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL DEFAULT 1,
  `user_uuid` varchar(255) NOT NULL,
  `user_fullname` varchar(25) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(150) NOT NULL,
  `user_status` tinyint(1) NOT NULL DEFAULT 0,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  CONSTRAINT UK_users__user_uuid UNIQUE (user_uuid),
  CONSTRAINT UK_users__email UNIQUE (email),
  CONSTRAINT PK_users__id PRIMARY KEY (id),
  CONSTRAINT FK_users__group_id FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;
-- LOAD XML LOCAL INFILE 'test.xml' INTO TABLE institutions ROWS IDENTIFIED BY '<Table>';
-- --------------------------------------------------------

--
-- Table structure for table `institutions`
--

CREATE TABLE IF NOT EXISTS `institutions` (
  `id` int AUTO_INCREMENT,
  `city` varchar(50),
  `county` varchar(60),
  `institution_type` varchar(60),
  `institution_name` varchar(255),
  `web_address` varchar(150) DEFAULT NULL,
  CONSTRAINT PK_institutions__id PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_bind_institutions`
--

CREATE TABLE IF NOT EXISTS `users_bind_institutions` (
  `user_id` int NOT NULL,
  `institution_id` int,
  CONSTRAINT PK_users_bind_institutions__id PRIMARY KEY (user_id),
  CONSTRAINT FK_users_bind_institutions__user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT FK_users_bind_institutions__institution_id FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students_bind_teachers`
--

CREATE TABLE IF NOT EXISTS `students_bind_teachers` (
  `student_id` int NOT NULL,
  `teacher_id` int,
  CONSTRAINT PK_students_bind_teachers__student_id PRIMARY KEY (student_id),
  CONSTRAINT FK_students_bind_teachers__student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT FK_students_bind_teachers__teacher_id FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;
-- --------------------------------------------------------

--
-- Table structure for table `info_systems`
--

CREATE TABLE IF NOT EXISTS `info_systems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mac_address` varchar(50) NOT NULL,
  `network_name` varchar(255) NOT NULL,
  `os_name` varchar(50) NOT NULL,
  `os_version` varchar(100) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  CONSTRAINT PK_info_systems__id PRIMARY KEY (id),
  CONSTRAINT UK_info_systems__mac_address UNIQUE (mac_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `log_files`
--

CREATE TABLE IF NOT EXISTS `log_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `file_name` varchar(60) NOT NULL,
  `log_file_name` varchar(150) DEFAULT NULL,
  `mac_address` varchar(50) NOT NULL,
  `file_status` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_date` datetime DEFAULT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  CONSTRAINT PK_log_files__id PRIMARY KEY (id),
  CONSTRAINT FK_log_files__user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT FK_log_files__mac_address FOREIGN KEY (mac_address) REFERENCES info_systems(mac_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `log_files`
--

CREATE TABLE IF NOT EXISTS `log_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `file_name` varchar(60) NOT NULL,
  `mac_address` varchar(50) NOT NULL,
  `file_status` tinyint(1) NOT NULL DEFAULT 1,
  `upload_type` varchar(50) DEFAULT NULL,
  `deleted_date` datetime DEFAULT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  CONSTRAINT PK_log_files__id PRIMARY KEY (id),
  CONSTRAINT FK_log_files__user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT FK_log_files__mac_address FOREIGN KEY (mac_address) REFERENCES info_systems(mac_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `log_users`
--

CREATE TABLE IF NOT EXISTS `log_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `mac_address` varchar(50) NOT NULL,
  `process_name` varchar(25) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  CONSTRAINT PK_log_users__id PRIMARY KEY (id),
  CONSTRAINT FK_log_users__user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT FK_log_users__mac_address FOREIGN KEY (mac_address) REFERENCES info_systems(mac_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE IF NOT EXISTS `assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `teacher_id` varchar(50) NOT NULL,
  `file_log_id` varchar(25) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_date` datetime NOT NULL DEFAULT current_timestamp(),
  CONSTRAINT PK_assignments__id PRIMARY KEY (id),
  CONSTRAINT FK_assignments__student_id FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT FK_assignments__teacher_id FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT FK_assignments__file_log_id FOREIGN KEY (file_log_id) REFERENCES log_files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

COMMIT;

-- --------------------------------------------------------

--
-- Insert samples to `groups` Table
--

INSERT IGNORE INTO user_groups (id, title) VALUES (1, 'Ogrenci');
INSERT IGNORE INTO user_groups (id, title) VALUES (2, 'Ogretmen');
INSERT IGNORE INTO user_groups (id, title) VALUES (4, 'Mudur');
INSERT IGNORE INTO user_groups (id, title) VALUES (6, 'Ogretmen&Mudur');
INSERT IGNORE INTO user_groups (id, title) VALUES (8, 'Admin');

-- --------------------------------------------------------

--
-- Insert samples to `rights` Table
--

INSERT IGNORE INTO rights (id, title) VALUES (1, 'Ogrenci-hakları');
INSERT IGNORE INTO rights (id, title) VALUES (2, 'Ogretmen-hakları');
INSERT IGNORE INTO rights (id, title) VALUES (4, 'Mudur-hakları');
INSERT IGNORE INTO rights (id, title) VALUES (8, 'Admin-hakları');

-- --------------------------------------------------------

--
-- Insert samples to `group_rights` Table
--

INSERT IGNORE INTO group_rights (group_id, right_id) VALUES (1, 1);
INSERT IGNORE INTO group_rights (group_id, right_id) VALUES (2, 2);
INSERT IGNORE INTO group_rights (group_id, right_id) VALUES (4, 4);
INSERT IGNORE INTO group_rights (group_id, right_id) VALUES (6, 2);
INSERT IGNORE INTO group_rights (group_id, right_id) VALUES (6, 4);
INSERT IGNORE INTO group_rights (group_id, right_id) VALUES (8, 8);

-- --------------------------------------------------------

--
-- Insert samples to `classes` Table
--

INSERT IGNORE INTO classes (class) VALUES (1);
INSERT IGNORE INTO classes (class) VALUES (2);
INSERT IGNORE INTO classes (class) VALUES (3);
INSERT IGNORE INTO classes (class) VALUES (4);
INSERT IGNORE INTO classes (class) VALUES (5);
INSERT IGNORE INTO classes (class) VALUES (6);
INSERT IGNORE INTO classes (class) VALUES (7);
INSERT IGNORE INTO classes (class) VALUES (8);
INSERT IGNORE INTO classes (class) VALUES (9);
INSERT IGNORE INTO classes (class) VALUES (10);
INSERT IGNORE INTO classes (class) VALUES (11);
INSERT IGNORE INTO classes (class) VALUES (12);

-- --------------------------------------------------------

--
-- Insert samples to `class_branches` Table
--

INSERT IGNORE INTO class_branches (class_branch) VALUES ('A');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('B');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('C');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('Ç');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('D');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('E');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('F');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('G');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('Ğ');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('H');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('I');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('İ');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('J');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('K');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('L');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('M');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('N');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('O');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('Ö');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('P');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('R');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('S');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('Ş');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('T');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('U');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('Ü');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('V');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('Y');
INSERT IGNORE INTO class_branches (class_branch) VALUES ('Z');

-- --------------------------------------------------------

--
-- View `all_users`
--

CREATE OR REPLACE VIEW all_users AS
SELECT *
FROM users;

-- --------------------------------------------------------

--
-- View `all_students`
--
CREATE OR REPLACE VIEW all_students AS
SELECT *
FROM users
WHERE users.group_id = 1;

-- --------------------------------------------------------

--
-- View `all_teachers`
--

CREATE OR REPLACE VIEW all_teachers AS
SELECT *
FROM users
WHERE users.group_id = 2 or users.group_id = 6;

-- --------------------------------------------------------

--
-- View `all_managers_admins`
--

CREATE OR REPLACE VIEW all_managers_admins AS
SELECT * 
FROM users
WHERE users.group_id = 4 or users.group_id = 6 or users.group_id = 8;

-- --------------------------------------------------------

--
-- View `all_passive_users`
--

CREATE OR REPLACE VIEW all_passive_users AS
SELECT *
FROM users
WHERE users.user_status = 0;
-- --------------------------------------------------------

--
-- View `all_active_users`
--

CREATE OR REPLACE VIEW all_active_users AS
SELECT *
FROM users
WHERE users.user_status = 1;
-- --------------------------------------------------------

--
-- View `active_students`
--

CREATE OR REPLACE VIEW active_students AS
SELECT *
FROM users
WHERE users.group_id = 1 and users.user_status = 1;

-- --------------------------------------------------------

--
-- View `active_teachers`
--

CREATE OR REPLACE VIEW active_teachers AS
SELECT *
FROM users
WHERE (users.group_id = 2 or users.group_id = 6) and users.user_status = 1;

-- --------------------------------------------------------

--
-- View `active_managers_admins`
--

CREATE OR REPLACE VIEW active_managers_admins AS
SELECT *
FROM users
WHERE (users.group_id = 4 or users.group_id = 6 or users.group_id = 8) and users.user_status = 1;

-- --------------------------------------------------------

--
-- View `passive_students`
--

CREATE OR REPLACE VIEW passive_students AS
SELECT *
FROM users
WHERE users.group_id = 1 and users.user_status = 0;

-- --------------------------------------------------------

--
-- View `passive_teachers`
--

CREATE OR REPLACE VIEW passive_teachers AS
SELECT *
FROM users
WHERE (users.group_id = 2 or users.group_id = 6) and users.user_status = 0;

-- --------------------------------------------------------

--
-- View `passive_managers_admins`
--

CREATE OR REPLACE VIEW passive_managers_admins AS
SELECT *
FROM users
WHERE (users.group_id = 4 or users.group_id = 6 or users.group_id = 8) and users.user_status = 0;

-- --------------------------------------------------------

--
-- Stored Procedure for `log_users` and `info_systems`
--
DELIMITER //

CREATE PROCEDURE USER_LOGS__LOGIN(IN USER_ID int, IN MAC_ADDRESS varchar(50), IN NETWORK_NAME varchar(255), IN OS_NAME varchar(50), IN OS_VERSION varchar(100), IN PROCESS_NAME varchar(25))
BEGIN
  INSERT INTO info_systems (mac_address, network_name, os_name, os_version) VALUES (MAC_ADDRESS, NETWORK_NAME, OS_NAME, OS_VERSION)
    ON DUPLICATE KEY UPDATE network_name = NETWORK_NAME, os_name = OS_NAME, os_version = OS_VERSION;
  INSERT INTO log_users (user_id, mac_address, process_name) VALUES (USER_ID, MAC_ADDRESS, PROCESS_NAME);
END 

// DELIMITER ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
