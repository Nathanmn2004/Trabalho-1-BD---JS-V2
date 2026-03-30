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

CREATE INDEX idx_cliente_nome ON cliente(nome);
CREATE INDEX idx_produto_nome ON produto(nome);
CREATE INDEX idx_vendedor_nome ON vendedor(nome);
CREATE INDEX idx_venda_data ON venda(data_venda);

CREATE OR REPLACE VIEW v_vendas_detalhadas AS
SELECT 
    v.id AS venda_id,
    v.data_venda,
    v.cliente_id,
    c.nome AS cliente_nome,
    v.vendedor_id,
    vdr.nome AS vendedor_nome,
    v.total_bruto,
    v.desconto_percent,
    v.total_liquido,
    v.status
FROM venda v
JOIN cliente c ON v.cliente_id = c.id
JOIN vendedor vdr ON v.vendedor_id = vdr.id;

CREATE OR REPLACE PROCEDURE cancelar_venda(p_venda_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
    r_item RECORD;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM venda WHERE id = p_venda_id AND status = 'CONCLUIDA') THEN
        RAISE EXCEPTION 'Venda % não encontrada ou já cancelada.', p_venda_id;
    END IF;

    FOR r_item IN SELECT produto_id, quantidade FROM item_venda WHERE venda_id = p_venda_id LOOP
        UPDATE produto SET quantidade = quantidade + r_item.quantidade WHERE id = r_item.produto_id;
    END LOOP;
    UPDATE venda SET status = 'CANCELADA' WHERE id = p_venda_id;
    UPDATE pagamento SET status_confirmacao = 'CANCELADO' WHERE venda_id = p_venda_id;

    RAISE NOTICE 'Venda % cancelada e estoque restaurado.', p_venda_id;
END;
$$;
