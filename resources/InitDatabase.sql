CREATE DATABASE IF NOT EXISTS userLoginApplication;
USE userLoginApplication;

CREATE TABLE IF NOT EXISTS user_details (
    `id` INT UNSIGNED NOT NULL PRIMARY KEY,
    `mobile` INT UNSIGNED NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `hashed_password` VARCHAR(256) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `pan` VARCHAR(20) NOT NULL,
    `fathers_name` VARCHAR(255) NOT NULL,
    `dob` DATE NOT NULL,
    `creation_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updation_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY mobile(mobile),
    UNIQUE KEY email(email)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    `id` INT UNSIGNED NOT NULL PRIMARY KEY,
    `user_id` INT NOT NULL,
    `is_session_active` BOOLEAN NOT NULL DEFAULT 1,
    `session_started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `session_expiry_date` TIMESTAMP
);
