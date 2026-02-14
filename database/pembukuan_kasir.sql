-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 05 Des 2025 pada 10.20
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pembukuan_kasir`
--

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `daily_summary`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `daily_summary` (
`tanggal` date
,`type` varchar(14)
,`jumlah_transaksi` bigint(21)
,`total_amount` decimal(38,2)
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `logs`
--

INSERT INTO `logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'INSERT', 'modal', 1, NULL, '{\"modal_type\":\"modal_kas\",\"nominal\":100000,\"user_id\":4,\"added_by_owner\":true}', '103.172.172.35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 06:44:50'),
(2, 4, 'LOGIN', 'users', 4, NULL, '{\"username\":\"kasir1\",\"role\":\"kasir\"}', '103.172.172.35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 06:45:23'),
(3, 4, 'INSERT', 'transfer', 1, NULL, '{\"tanggal\":\"2025-12-05\",\"bank_tujuan\":\"BNI\",\"nomor_rekening\":\"1234597321\",\"nama_pemilik\":\"andi\",\"nominal\":100000,\"biaya\":5000,\"keterangan\":\"\",\"user_id\":4,\"status\":\"pending\"}', '103.172.172.35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 06:46:22'),
(4, 1, 'UPDATE_STATUS', 'transfer', 1, '{\"status\":\"pending\"}', '{\"status\":\"lunas\"}', '103.172.172.35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 06:46:32'),
(5, 3, 'LOGIN', 'users', 3, NULL, '{\"username\":\"kasir2\",\"role\":\"kasir\"}', '86.48.11.253', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 06:49:44'),
(6, 1, 'LOGIN', 'users', 1, NULL, '{\"username\":\"admin\",\"role\":\"owner\"}', '86.48.11.253', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 06:50:17'),
(7, 1, 'LOGIN', 'users', 1, NULL, '{\"username\":\"admin\",\"role\":\"owner\"}', '86.48.11.253', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 06:55:21'),
(8, 1, 'LOGIN', 'users', 1, NULL, '{\"username\":\"admin\",\"role\":\"owner\"}', '103.172.172.35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 07:01:54'),
(9, 1, 'LOGIN', 'users', 1, NULL, '{\"username\":\"admin\",\"role\":\"owner\"}', '185.213.83.128', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 07:31:49'),
(10, 1, 'LOGIN', 'users', 1, NULL, '{\"username\":\"admin\",\"role\":\"owner\"}', '185.213.83.128', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 07:36:41'),
(11, 4, 'LOGIN', 'users', 4, NULL, '{\"username\":\"kasir1\",\"role\":\"kasir\"}', '185.213.83.128', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 07:37:10'),
(12, 3, 'LOGIN', 'users', 3, NULL, '{\"username\":\"kasir2\",\"role\":\"kasir\"}', '103.172.172.35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 07:49:38'),
(13, 1, 'LOGIN', 'users', 1, NULL, '{\"username\":\"admin\",\"role\":\"owner\"}', '185.213.83.128', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 07:51:20'),
(14, 1, 'LOGIN', 'users', 1, NULL, '{\"username\":\"admin\",\"role\":\"owner\"}', '185.213.83.128', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 08:24:28'),
(15, 1, 'LOGIN', 'users', 1, NULL, '{\"username\":\"admin\",\"role\":\"owner\"}', '185.213.83.128', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 08:48:01');

-- --------------------------------------------------------

--
-- Struktur dari tabel `modal`
--

CREATE TABLE `modal` (
  `id` int(11) NOT NULL,
  `modal_type` enum('karangsari','fastpay','mmbc','payfazz','posfin','buku_agen','modal_kas') NOT NULL,
  `nominal` decimal(15,2) NOT NULL DEFAULT 0.00,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `modal`
--

INSERT INTO `modal` (`id`, `modal_type`, `nominal`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'modal_kas', 100000.00, 4, '2025-12-05 06:44:50', '2025-12-05 06:44:50');

--
-- Trigger `modal`
--
DELIMITER $$
CREATE TRIGGER `modal_after_insert_update` AFTER INSERT ON `modal` FOR EACH ROW BEGIN
  INSERT INTO saldo (user_id, total_saldo, created_at, updated_at) 
  VALUES (NEW.user_id, 0, NOW(), NOW())
  ON DUPLICATE KEY UPDATE 
  total_saldo = (
    (SELECT COALESCE(SUM(nominal), 0) FROM modal WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(nominal + biaya), 0) FROM transfer WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(biaya), 0) FROM transfer_debit WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(biaya_tarik - nominal_tarik), 0) FROM tarik_tunai WHERE user_id = NEW.user_id)
  ),
  updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `saldo`
--

CREATE TABLE `saldo` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_saldo` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `saldo`
--

INSERT INTO `saldo` (`id`, `user_id`, `total_saldo`, `created_at`, `updated_at`) VALUES
(1, 4, 205000.00, '2025-12-05 06:44:50', '2025-12-05 06:46:22');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tarik_tunai`
--

CREATE TABLE `tarik_tunai` (
  `id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `bank` varchar(50) NOT NULL,
  `nominal_tarik` decimal(15,2) NOT NULL,
  `biaya_tarik` decimal(15,2) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `status` enum('pending','lunas') DEFAULT 'pending',
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Trigger `tarik_tunai`
--
DELIMITER $$
CREATE TRIGGER `tarik_tunai_after_insert` AFTER INSERT ON `tarik_tunai` FOR EACH ROW BEGIN
  INSERT INTO saldo (user_id, total_saldo, created_at, updated_at) 
  VALUES (NEW.user_id, 0, NOW(), NOW())
  ON DUPLICATE KEY UPDATE 
  total_saldo = (
    (SELECT COALESCE(SUM(nominal), 0) FROM modal WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(nominal + biaya), 0) FROM transfer WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(biaya), 0) FROM transfer_debit WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(biaya_tarik - nominal_tarik), 0) FROM tarik_tunai WHERE user_id = NEW.user_id)
  ),
  updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `transfer`
--

CREATE TABLE `transfer` (
  `id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `bank_tujuan` varchar(50) NOT NULL,
  `nomor_rekening` varchar(50) NOT NULL,
  `nama_pemilik` varchar(100) NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `biaya` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total` decimal(15,2) GENERATED ALWAYS AS (`nominal` + `biaya`) STORED,
  `keterangan` text DEFAULT NULL,
  `status` enum('pending','lunas') DEFAULT 'pending',
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `transfer`
--

INSERT INTO `transfer` (`id`, `tanggal`, `bank_tujuan`, `nomor_rekening`, `nama_pemilik`, `nominal`, `biaya`, `keterangan`, `status`, `user_id`, `created_at`, `updated_at`) VALUES
(1, '2025-12-05', 'BNI', '1234597321', 'andi', 100000.00, 5000.00, '', 'lunas', 4, '2025-12-05 06:46:22', '2025-12-05 06:46:32');

--
-- Trigger `transfer`
--
DELIMITER $$
CREATE TRIGGER `transfer_after_insert` AFTER INSERT ON `transfer` FOR EACH ROW BEGIN
  INSERT INTO saldo (user_id, total_saldo, created_at, updated_at) 
  VALUES (NEW.user_id, 0, NOW(), NOW())
  ON DUPLICATE KEY UPDATE 
  total_saldo = (
    (SELECT COALESCE(SUM(nominal), 0) FROM modal WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(nominal + biaya), 0) FROM transfer WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(biaya), 0) FROM transfer_debit WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(biaya_tarik - nominal_tarik), 0) FROM tarik_tunai WHERE user_id = NEW.user_id)
  ),
  updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `transfer_debit`
--

CREATE TABLE `transfer_debit` (
  `id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `biaya` decimal(15,2) NOT NULL,
  `keterangan` text NOT NULL,
  `status` enum('pending','lunas') DEFAULT 'pending',
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Trigger `transfer_debit`
--
DELIMITER $$
CREATE TRIGGER `transfer_debit_after_insert` AFTER INSERT ON `transfer_debit` FOR EACH ROW BEGIN
  INSERT INTO saldo (user_id, total_saldo, created_at, updated_at) 
  VALUES (NEW.user_id, 0, NOW(), NOW())
  ON DUPLICATE KEY UPDATE 
  total_saldo = (
    (SELECT COALESCE(SUM(nominal), 0) FROM modal WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(nominal + biaya), 0) FROM transfer WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(biaya), 0) FROM transfer_debit WHERE user_id = NEW.user_id) +
    (SELECT COALESCE(SUM(biaya_tarik - nominal_tarik), 0) FROM tarik_tunai WHERE user_id = NEW.user_id)
  ),
  updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `transfer_favorit`
--

CREATE TABLE `transfer_favorit` (
  `id` int(11) NOT NULL,
  `bank_tujuan` varchar(50) NOT NULL,
  `nomor_rekening` varchar(50) NOT NULL,
  `nama_pemilik` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `transfer_favorit`
--

INSERT INTO `transfer_favorit` (`id`, `bank_tujuan`, `nomor_rekening`, `nama_pemilik`, `user_id`, `created_at`) VALUES
(1, 'BNI', '1234597321', 'andi', 4, '2025-12-05 06:46:22');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('kasir','owner') NOT NULL DEFAULT 'kasir',
  `status` enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner', 'aktif', '2025-11-30 16:14:13', '2025-11-30 16:14:13'),
(2, 'kasir3', '$2a$10$KS6pTrRYEDdf5vGZui9YVOGgfT9/qSVBUxXAc1U4rg7rTFBXdLv4W', 'kasir', 'aktif', '2025-11-30 16:14:13', '2025-12-04 14:13:37'),
(3, 'kasir2', '$2a$10$/QQ5BQ/0WeExBQlPtzGiAOORTpwKzeSEYmBxaRYuCr6oRyVipCHbu', 'kasir', 'aktif', '2025-11-30 17:57:14', '2025-12-04 14:13:09'),
(4, 'kasir1', '$2a$10$19XNnNPOSB0rjvy8OWebmuBtqd3sn2GOi3zKzqz69m2Xhrc2xLecC', 'kasir', 'aktif', '2025-12-03 10:23:39', '2025-12-04 14:11:25'),
(5, 'coba', '$2a$10$BTY7HOwWj6p4oLqXrOXtP.BQsxBwCuCRwNnpNw2hrlnPTHG/hDvo2', 'kasir', 'aktif', '2025-12-04 09:04:16', '2025-12-04 09:04:16'),
(6, 'kasir4', '$2a$10$Ez2hWQfK7J3uRH5YKx/WnODaUcnMHZ3Zxil.jGL3AeHu7v4eQcz5i', 'kasir', 'aktif', '2025-12-04 14:11:03', '2025-12-04 14:11:03');

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `user_summary`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `user_summary` (
`id` int(11)
,`username` varchar(50)
,`role` enum('kasir','owner')
,`status` enum('aktif','nonaktif')
,`current_saldo` decimal(15,2)
,`total_modal` decimal(37,2)
,`total_transfers` bigint(21)
,`total_withdrawals` bigint(21)
);

-- --------------------------------------------------------

--
-- Struktur untuk view `daily_summary`
--
DROP TABLE IF EXISTS `daily_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`isad8273`@`localhost` SQL SECURITY DEFINER VIEW `daily_summary`  AS SELECT cast(`transfer`.`created_at` as date) AS `tanggal`, 'transfer' AS `type`, count(0) AS `jumlah_transaksi`, sum(`transfer`.`nominal` + `transfer`.`biaya`) AS `total_amount` FROM `transfer` GROUP BY cast(`transfer`.`created_at` as date)union all select cast(`transfer_debit`.`created_at` as date) AS `tanggal`,'transfer_debit' AS `type`,count(0) AS `jumlah_transaksi`,sum(`transfer_debit`.`biaya`) AS `total_amount` from `transfer_debit` group by cast(`transfer_debit`.`created_at` as date) union all select cast(`tarik_tunai`.`created_at` as date) AS `tanggal`,'tarik_tunai' AS `type`,count(0) AS `jumlah_transaksi`,sum(`tarik_tunai`.`biaya_tarik` - `tarik_tunai`.`nominal_tarik`) AS `total_amount` from `tarik_tunai` group by cast(`tarik_tunai`.`created_at` as date) order by `tanggal` desc,`type`  ;

-- --------------------------------------------------------

--
-- Struktur untuk view `user_summary`
--
DROP TABLE IF EXISTS `user_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`isad8273`@`localhost` SQL SECURITY DEFINER VIEW `user_summary`  AS SELECT `u`.`id` AS `id`, `u`.`username` AS `username`, `u`.`role` AS `role`, `u`.`status` AS `status`, coalesce(`s`.`total_saldo`,0) AS `current_saldo`, coalesce(`modal_total`.`total`,0) AS `total_modal`, coalesce(`transfer_count`.`count`,0) AS `total_transfers`, coalesce(`tarik_count`.`count`,0) AS `total_withdrawals` FROM ((((`users` `u` left join `saldo` `s` on(`u`.`id` = `s`.`user_id`)) left join (select `modal`.`user_id` AS `user_id`,sum(`modal`.`nominal`) AS `total` from `modal` group by `modal`.`user_id`) `modal_total` on(`u`.`id` = `modal_total`.`user_id`)) left join (select `transfer`.`user_id` AS `user_id`,count(0) AS `count` from `transfer` group by `transfer`.`user_id`) `transfer_count` on(`u`.`id` = `transfer_count`.`user_id`)) left join (select `tarik_tunai`.`user_id` AS `user_id`,count(0) AS `count` from `tarik_tunai` group by `tarik_tunai`.`user_id`) `tarik_count` on(`u`.`id` = `tarik_count`.`user_id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_table_name` (`table_name`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indeks untuk tabel `modal`
--
ALTER TABLE `modal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_modal_user_type` (`user_id`,`modal_type`);

--
-- Indeks untuk tabel `saldo`
--
ALTER TABLE `saldo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_saldo` (`user_id`);

--
-- Indeks untuk tabel `tarik_tunai`
--
ALTER TABLE `tarik_tunai`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tanggal` (`tanggal`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_tarik_tunai_tanggal_user` (`tanggal`,`user_id`);

--
-- Indeks untuk tabel `transfer`
--
ALTER TABLE `transfer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tanggal` (`tanggal`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_transfer_tanggal_user` (`tanggal`,`user_id`);

--
-- Indeks untuk tabel `transfer_debit`
--
ALTER TABLE `transfer_debit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tanggal` (`tanggal`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_transfer_debit_tanggal_user` (`tanggal`,`user_id`);

--
-- Indeks untuk tabel `transfer_favorit`
--
ALTER TABLE `transfer_favorit`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorit` (`bank_tujuan`,`nomor_rekening`,`nama_pemilik`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_users_role_status` (`role`,`status`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `modal`
--
ALTER TABLE `modal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `saldo`
--
ALTER TABLE `saldo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `tarik_tunai`
--
ALTER TABLE `tarik_tunai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `transfer`
--
ALTER TABLE `transfer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `transfer_debit`
--
ALTER TABLE `transfer_debit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `transfer_favorit`
--
ALTER TABLE `transfer_favorit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `modal`
--
ALTER TABLE `modal`
  ADD CONSTRAINT `modal_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `saldo`
--
ALTER TABLE `saldo`
  ADD CONSTRAINT `saldo_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tarik_tunai`
--
ALTER TABLE `tarik_tunai`
  ADD CONSTRAINT `tarik_tunai_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transfer`
--
ALTER TABLE `transfer`
  ADD CONSTRAINT `transfer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transfer_debit`
--
ALTER TABLE `transfer_debit`
  ADD CONSTRAINT `transfer_debit_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transfer_favorit`
--
ALTER TABLE `transfer_favorit`
  ADD CONSTRAINT `transfer_favorit_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
