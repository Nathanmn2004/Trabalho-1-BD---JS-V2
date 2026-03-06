const pool = require('../db');
const { Vendedor } = require('../models');

class VendedorService {
    async inserir(nome, matricula, ativo) {
        const query = 'INSERT INTO vendedor (nome, matricula, ativo) VALUES ($1, $2, $3) RETURNING *';
        const res = await pool.query(query, [nome, matricula, ativo]);
        const v = res.rows[0];
        return new Vendedor(v.id, v.nome, v.matricula, v.ativo);
    }

    async listar() {
        const res = await pool.query('SELECT * FROM vendedor WHERE ativo = true ORDER BY nome ASC');
        return res.rows.map(v => new Vendedor(v.id, v.nome, v.matricula, v.ativo));
    }

    async exibir(id) {
        const res = await pool.query('SELECT * FROM vendedor WHERE id = $1', [id]);
        if (res.rowCount === 0) {
            return null;
        }
        const v = res.rows[0];
        return new Vendedor(v.id, v.nome, v.matricula, v.ativo);
    }

    async alterar(id, nome, matricula, ativo) {
        const query = 'UPDATE vendedor SET nome = $1, matricula = $2, ativo = $3 WHERE id = $4 RETURNING *';
        const res = await pool.query(query, [nome, matricula, ativo, id]);
        if (res.rowCount === 0) {
            throw new Error("Vendedor não encontrado.");
        }
        const v = res.rows[0];
        return new Vendedor(v.id, v.nome, v.matricula, v.ativo);
    }

    async remover(id) {
        const res = await pool.query('DELETE FROM vendedor WHERE id = $1 RETURNING *', [id]);
        if (res.rowCount === 0) {
            throw new Error("Vendedor não encontrado.");
        }
    }

    async procurarPorNome(nome) {
        const res = await pool.query('SELECT * FROM vendedor WHERE nome = $1', [nome]);
        return res.rows.map(v => new Vendedor(v.id, v.nome, v.matricula, v.ativo));
    }
}

module.exports = new VendedorService();
