-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Jan 26, 2024 at 12:14 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `urlshortner`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(10) NOT NULL,
  `password` varchar(255) NOT NULL,
  `otp` int(11) DEFAULT NULL,
  `otp_date_time` timestamp NULL DEFAULT NULL,
  `profile_picture` longtext DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `account_type` enum('individual','organisation') NOT NULL DEFAULT 'individual',
  `email_verified` enum('true','false') NOT NULL DEFAULT 'false',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_id`, `name`, `email`, `phone`, `password`, `otp`, `otp_date_time`, `profile_picture`, `status`, `account_type`, `email_verified`, `created_at`, `updated_at`) VALUES
(1, '2b9a94c7-bcec-4d7b-80bc-8b489ea5e280', 'soubhagya samal', 'soubhagyasamal03@gmail.com', '9556241447', '$2a$10$nVzhdGndn3mNh.P8LvLhpOEyNdOyXuWp4gLVQnw1U17q2UzbuWyQy', NULL, NULL, NULL, 'active', 'individual', 'false', '2024-01-26 10:46:23', '2024-01-26 10:48:25'),
(2, 'bcfab6a5-8f93-4c2b-9188-3629d5e19596', 'soubhagya samal', 'soubhagyasamal04@gmail.com', '9556241448', '$2a$10$DViLX/5caFRVXVRG/qRsdOhiV07JkONV1OlN0wzBvZpJVFKKBhley', NULL, NULL, NULL, 'active', 'individual', 'false', '2024-01-26 10:47:24', '2024-01-26 10:48:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
