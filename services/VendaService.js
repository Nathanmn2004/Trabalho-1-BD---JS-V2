const pool = require('../db');
const { Venda, ItemVenda, Pagamento } = require('../models');

class VendaService {
    async realizarVenda(clienteId, vendedorId, itens, tipoPagamento) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const resCli = await client.query('SELECT torce_flamengo, assiste_one_piece, cidade FROM cliente WHERE id = $1', [clienteId]);

            if (resCli.rowCount === 0) {
                throw new Error("Cliente não encontrado.");
            }

            const cli = resCli.rows[0];
            const desconto = (cli.torce_flamengo || cli.assiste_one_piece || cli.cidade.toLowerCase() === 'sousa') ? 10.0 : 0.0;

            const resVenda = await client.query(
                'INSERT INTO venda (cliente_id, vendedor_id, desconto_percent, total_bruto, total_liquido, status) VALUES ($1, $2, $3, 0, 0, \'CONCLUIDA\') RETURNING *',
                [clienteId, vendedorId, desconto]
            );
            const vData = resVenda.rows[0];
            const venda = new Venda(vData.id, vData.cliente_id, vData.vendedor_id, vData.data_venda, vData.desconto_percent, vData.total_bruto, vData.total_liquido, vData.status);

            let totalBruto = 0;
            const itensCriados = [];

            for (const itemData of itens) {
                const resProd = await client.query('SELECT preco, quantidade, nome FROM produto WHERE id = $1 FOR UPDATE', [itemData.produtoId]);

                if (resProd.rowCount === 0) {
                    throw new Error(`Produto ${itemData.produtoId} não existe.`);
                }

                const prod = resProd.rows[0];

                if (prod.quantidade < itemData.qtd) {
                    throw new Error(`Estoque insuficiente para ${prod.nome}.`);
                }

                await client.query('UPDATE produto SET quantidade = quantidade - $1 WHERE id = $2', [itemData.qtd, itemData.produtoId]);

                const resItem = await client.query(
                    'INSERT INTO item_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4) RETURNING *',
                    [venda.id, itemData.produtoId, itemData.qtd, prod.preco]
                );
                const i = resItem.rows[0];
                itensCriados.push(new ItemVenda(i.id, i.venda_id, i.produto_id, i.quantidade, i.preco_unitario));

                totalBruto += (itemData.qtd * prod.preco);
            }

            const totalLiquido = totalBruto * (1 - (desconto / 100));
            await client.query('UPDATE venda SET total_bruto = $1, total_liquido = $2 WHERE id = $3', [totalBruto, totalLiquido, venda.id]);

            venda.total_bruto = totalBruto;
            venda.total_liquido = totalLiquido;

            const resPag = await client.query(
                'INSERT INTO pagamento (venda_id, tipo, status_confirmacao) VALUES ($1, $2, $3) RETURNING *',
                [venda.id, tipoPagamento, 'PENDENTE']
            );
            const p = resPag.rows[0];
            const pagamento = new Pagamento(p.id, p.venda_id, p.tipo, p.status_confirmacao, p.codigo_transacao, p.criado_em);

            await client.query('COMMIT');
            return { venda, itens: itensCriados, pagamento };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async listarVendas() {
        const res = await pool.query('SELECT * FROM venda ORDER BY data_venda DESC');
        return res.rows.map(v => new Venda(v.id, v.cliente_id, v.vendedor_id, v.data_venda, v.desconto_percent, v.total_bruto, v.total_liquido, v.status));
    }

    async gerarRelatorioGeral() {
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM produto) as qtd_produtos,
                (SELECT COUNT(*) FROM cliente) as qtd_clientes,
                (SELECT COUNT(*) FROM vendedor) as qtd_vendedores,
                (SELECT COUNT(*) FROM venda WHERE status = 'CONCLUIDA') as qtd_vendas,
                (SELECT SUM(total_liquido) FROM venda WHERE status = 'CONCLUIDA') as faturamento_total
        `);
        return stats.rows[0];
    }
}

module.exports = new VendaService();
