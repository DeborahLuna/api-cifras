-- Script de inicialização do banco de dados api_cifras
-- Execute este script uma única vez para criar o schema

CREATE DATABASE api_cifras;

\c api_cifras;

CREATE TABLE IF NOT EXISTS songs (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  artist     VARCHAR(255) NOT NULL,
  key        VARCHAR(50)  NOT NULL,
  chords     TEXT         NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Índice para buscas frequentes por artista
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs (artist);

-- Dados de exemplo
INSERT INTO songs (title, artist, key, chords) VALUES
  ('Música Teste', 'Artista Teste', 'Teste Key', 'Este é um teste de cifra');
