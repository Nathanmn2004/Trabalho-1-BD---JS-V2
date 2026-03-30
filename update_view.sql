DROP VIEW IF EXISTS v_vendas_detalhadas;
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
