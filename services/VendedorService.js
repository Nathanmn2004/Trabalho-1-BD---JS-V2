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
        const fields = [];
        const values = [];
        let queryIdx = 1;

        if (nome !== undefined && nome !== '') {
            fields.push(`nome = $${queryIdx++}`);
            values.push(nome);
        }
        if (matricula !== undefined && matricula !== '') {
            fields.push(`matricula = $${queryIdx++}`);
            values.push(matricula);
        }
        if (ativo !== undefined && ativo !== '') {
            fields.push(`ativo = $${queryIdx++}`);
            values.push(ativo);
        }

        if (fields.length === 0) {
            return this.exibir(id);
        }

        values.push(id);
        const query = `UPDATE vendedor SET ${fields.join(', ')} WHERE id = $${queryIdx} RETURNING *`;
        const res = await pool.query(query, values);
        
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
