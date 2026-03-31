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
        const fields = [];
        const values = [];
        let queryIdx = 1;

        if (nome !== undefined && nome !== '') {
            fields.push(`nome = $${queryIdx++}`);
            values.push(nome);
        }
        if (cpf !== undefined && cpf !== '') {
            fields.push(`cpf = $${queryIdx++}`);
            values.push(cpf);
        }
        if (telefone !== undefined && telefone !== '') {
            fields.push(`telefone = $${queryIdx++}`);
            values.push(telefone);
        }
        if (cidade !== undefined && cidade !== '') {
            fields.push(`cidade = $${queryIdx++}`);
            values.push(cidade);
        }
        if (torce_flamengo !== undefined && torce_flamengo !== '') {
            fields.push(`torce_flamengo = $${queryIdx++}`);
            values.push(torce_flamengo);
        }
        if (assiste_one_piece !== undefined && assiste_one_piece !== '') {
            fields.push(`assiste_one_piece = $${queryIdx++}`);
            values.push(assiste_one_piece);
        }

        if (fields.length === 0) {
            return this.exibir(id);
        }

        values.push(id);
        const query = `UPDATE cliente SET ${fields.join(', ')} WHERE id = $${queryIdx} RETURNING *`;
        const res = await pool.query(query, values);
        
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
