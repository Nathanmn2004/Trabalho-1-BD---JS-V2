-- schema.sql (PostgreSQL)

DROP TABLE IF EXISTS pagamento CASCADE;
DROP TABLE IF EXISTS item_venda CASCADE;
DROP TABLE IF EXISTS venda CASCADE;
DROP TABLE IF EXISTS produto CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS vendedor CASCADE;

-- ====== TABELAS ======

CREATE TABLE cliente (
  id              SERIAL PRIMARY KEY,
  nome            TEXT NOT NULL,
  cpf             TEXT NOT NULL UNIQUE,
  telefone        TEXT NOT NULL,
  cidade          TEXT NOT NULL,
  torce_flamengo  BOOLEAN NOT NULL DEFAULT FALSE,
  assiste_one_piece BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE vendedor (
  id        SERIAL PRIMARY KEY,
  nome      TEXT NOT NULL,
  matricula TEXT NOT NULL UNIQUE,
  ativo     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE produto (
  id              SERIAL PRIMARY KEY,
  nome            TEXT NOT NULL,
  marca           TEXT NOT NULL,
  categoria       TEXT NOT NULL,
  preco           NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  quantidade      INT NOT NULL CHECK (quantidade >= 0),
  fabricado_em_mari BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE venda (
  id              SERIAL PRIMARY KEY,
  cliente_id      INT NOT NULL REFERENCES cliente(id) ON DELETE RESTRICT,
  vendedor_id     INT NOT NULL REFERENCES vendedor(id) ON DELETE RESTRICT,
  data_venda      TIMESTAMP NOT NULL DEFAULT NOW(),
  desconto_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (desconto_percent >= 0),
  total_bruto     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_bruto >= 0),
  total_liquido   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_liquido >= 0),
  status          TEXT NOT NULL DEFAULT 'CONCLUIDA' CHECK (status IN ('CONCLUIDA', 'CANCELADA'))
);

CREATE TABLE item_venda (
  id            SERIAL PRIMARY KEY,
  venda_id      INT NOT NULL REFERENCES venda(id) ON DELETE CASCADE,
  produto_id    INT NOT NULL REFERENCES produto(id) ON DELETE RESTRICT,
  quantidade    INT NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(10,2) NOT NULL CHECK (preco_unitario >= 0),
  UNIQUE (venda_id, produto_id)
);

CREATE TABLE pagamento (
  id              SERIAL PRIMARY KEY,
  venda_id         INT NOT NULL UNIQUE REFERENCES venda(id) ON DELETE CASCADE,
  tipo             TEXT NOT NULL CHECK (tipo IN ('CARTAO','BOLETO','PIX','BERRIES')),
  status_confirmacao TEXT NOT NULL DEFAULT 'PENDENTE'
    CHECK (status_confirmacao IN ('PENDENTE','CONFIRMADO','RECUSADO','CANCELADO')),
  codigo_transacao TEXT,
  criado_em        TIMESTAMP NOT NULL DEFAULT NOW()
);

