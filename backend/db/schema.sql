-- Customer Management Pro - database schema
-- Apply with:  mysql -u <user> -p <db_name> < db/schema.sql
-- Tables and columns follow docs/spec/functional-design.md section 1.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS word;
DROP TABLE IF EXISTS chapter;
DROP TABLE IF EXISTS course;
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
  -- Public URL path of the uploaded file, e.g. '/upload/<uuid>.png'. The binary
  -- itself lives on disk under backend/public/upload (see src/ult/upload.ts).
  detail     VARCHAR(512) NULL,
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

CREATE TABLE course (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(255) NOT NULL,
  imageId    BIGINT       NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_course_imageId (imageId),
  CONSTRAINT fk_course_image FOREIGN KEY (imageId) REFERENCES file (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE chapter (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  number     INT          NOT NULL,
  name       VARCHAR(255) NOT NULL,
  imageId    BIGINT       NULL,
  courseId   BIGINT       NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_chapter_imageId (imageId),
  KEY ix_chapter_courseId (courseId),
  CONSTRAINT fk_chapter_image  FOREIGN KEY (imageId)  REFERENCES file (id)   ON DELETE SET NULL,
  CONSTRAINT fk_chapter_course FOREIGN KEY (courseId) REFERENCES course (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE word (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  word          VARCHAR(255) NOT NULL,
  explain       TEXT         NULL,
  -- Each references a `file` row (the uploaded image / sound / spoken explanation).
  imageId       BIGINT       NULL,
  soundId       BIGINT       NULL,
  readExplainId BIGINT       NULL,
  chapterId     BIGINT       NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_word_imageId (imageId),
  KEY ix_word_soundId (soundId),
  KEY ix_word_readExplainId (readExplainId),
  KEY ix_word_chapterId (chapterId),
  CONSTRAINT fk_word_image        FOREIGN KEY (imageId)       REFERENCES file (id)    ON DELETE SET NULL,
  CONSTRAINT fk_word_sound        FOREIGN KEY (soundId)       REFERENCES file (id)    ON DELETE SET NULL,
  CONSTRAINT fk_word_read_explain FOREIGN KEY (readExplainId) REFERENCES file (id)    ON DELETE SET NULL,
  CONSTRAINT fk_word_chapter      FOREIGN KEY (chapterId)     REFERENCES chapter (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
