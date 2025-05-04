
-- 🔄 RESET COMPLETO DEL SCHEMA PARA `algaida_volei_club`
-- Generado el 2025-05-03 15:52:41

CREATE DATABASE IF NOT EXISTS algaida_volei_club;

USE algaida_volei_club;

DROP TABLE IF EXISTS payments, documents, legal_guardians, registrations, teams, categories, players, seasons, form_status;

CREATE TABLE players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  dni VARCHAR(20) UNIQUE,
  email VARCHAR(150),
  phone VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seasons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT 0,
  is_locked BOOLEAN DEFAULT 0
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  min_age INT,
  max_age INT
);

CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  coach_name VARCHAR(100),
  category_id INT,
  season_id INT,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (season_id) REFERENCES seasons(id)
);

CREATE TABLE registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT,
  season_id INT,
  team_id INT,
  category_id INT,
  registered_at DATETIME,
  total_fee DECIMAL(8,2),
  split_payment BOOLEAN DEFAULT 0,
  participate_lottery BOOLEAN DEFAULT 0,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (season_id) REFERENCES seasons(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE legal_guardians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT,
  season_id INT,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  dni VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(150),
  relationship VARCHAR(100),
  created_at DATETIME,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (season_id) REFERENCES seasons(id)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  season_id INT NOT NULL,
  amount DECIMAL(8,2),
  paid_at DATETIME,
  stripe_payment_id VARCHAR(255),
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (season_id) REFERENCES seasons(id)
);

CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  season_id INT NOT NULL,
  doc_type ENUM('lopd', 'usoimagenes', 'dni', 'otros') NOT NULL,
  file_url TEXT,
  uploaded_at DATETIME,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (season_id) REFERENCES seasons(id)
);

CREATE TABLE form_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  season_id INT NOT NULL,
  opens_at DATE NOT NULL,
  closes_at DATE NOT NULL,
  enabled BOOLEAN DEFAULT 1,
  FOREIGN KEY (season_id) REFERENCES seasons(id)
);
