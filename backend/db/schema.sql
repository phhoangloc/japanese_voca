-- Customer Management Pro - database schema
-- Apply with:  mysql -u <user> -p <db_name> < db/schema.sql
-- Tables and columns follow docs/spec/functional-design.md section 1.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS file;
DROP TABLE IF EXISTS admin;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE admin (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  username   VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_username (username),
  UNIQUE KEY uq_admin_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE file (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(255) NOT NULL,
  detail     TEXT         NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE customer (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  username   VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  point      INT          NOT NULL DEFAULT 0,
  avatarId   BIGINT       NULL,
  adminId    BIGINT       NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customer_username (username),
  UNIQUE KEY uq_customer_email (email),
  KEY ix_customer_adminId (adminId),
  KEY ix_customer_avatarId (avatarId),
  CONSTRAINT fk_customer_admin  FOREIGN KEY (adminId)  REFERENCES admin (id) ON DELETE RESTRICT,
  CONSTRAINT fk_customer_avatar FOREIGN KEY (avatarId) REFERENCES file (id)  ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
