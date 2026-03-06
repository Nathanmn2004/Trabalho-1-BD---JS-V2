const pool = require('../db');
const { Cliente, Venda } = require('../models');

class ClienteService {
    async inserir(nome, cpf, telefone, cidade, torce_flamengo, assiste_one_piece) {
        const query = 'INSERT INTO cliente (nome, cpf, telefone, cidade, torce_flamengo, assiste_one_piece) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const res = await pool.query(query, [nome, cpf, telefone, cidade, torce_flamengo, assiste_one_piece]);
        const c = res.rows[0];
        return new Cliente(c.id, c.nome, c.cpf, c.telefone, c.cidade, c.torce_flamengo, c.assiste_one_piece, c.criado_em);
    }

    async listar() {
        const res = await pool.query('SELECT * FROM cliente ORDER BY nome ASC');
        return res.rows.map(c => new Cliente(c.id, c.nome, c.cpf, c.telefone, c.cidade, c.torce_flamengo, c.assiste_one_piece, c.criado_em));
    }

    async exibir(id) {
        const res = await pool.query('SELECT * FROM cliente WHERE id = $1', [id]);
        if (res.rowCount === 0) {
            return null;
        }
        const c = res.rows[0];
        return new Cliente(c.id, c.nome, c.cpf, c.telefone, c.cidade, c.torce_flamengo, c.assiste_one_piece, c.criado_em);
    }

    async alterar(id, nome, cpf, telefone, cidade, torce_flamengo, assiste_one_piece) {
        const query = 'UPDATE cliente SET nome = $1, cpf = $2, telefone = $3, cidade = $4, torce_flamengo = $5, assiste_one_piece = $6 WHERE id = $7 RETURNING *';
        const res = await pool.query(query, [nome, cpf, telefone, cidade, torce_flamengo, assiste_one_piece, id]);
        if (res.rowCount === 0) {
            throw new Error("Cliente não encontrado.");
        }
        const c = res.rows[0];
        return new Cliente(c.id, c.nome, c.cpf, c.telefone, c.cidade, c.torce_flamengo, c.assiste_one_piece, c.criado_em);
    }

    async remover(id) {
        const res = await pool.query('DELETE FROM cliente WHERE id = $1 RETURNING *', [id]);
        if (res.rowCount === 0) {
            throw new Error("Cliente não encontrado.");
        }
    }

    async procurarPorNome(nome) {
        const res = await pool.query('SELECT * FROM cliente WHERE nome = $1', [nome]);
        return res.rows.map(c => new Cliente(c.id, c.nome, c.cpf, c.telefone, c.cidade, c.torce_flamengo, c.assiste_one_piece, c.criado_em));
    }

    async exibirCompras(clienteId) {
        const res = await pool.query('SELECT * FROM venda WHERE cliente_id = $1', [clienteId]);
        return res.rows.map(v => new Venda(v.id, v.cliente_id, v.vendedor_id, v.data_venda, v.desconto_percent, v.total_bruto, v.total_liquido, v.status));
    }
}

module.exports = new ClienteService();
