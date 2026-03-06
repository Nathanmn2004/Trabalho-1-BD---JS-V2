const pool = require('../db');
const { Produto } = require('../models');

class ProdutoService {
    async inserir(nome, marca, categoria, preco, quantidade, fabricado_em_mari) {
        const query = 'INSERT INTO produto (nome, marca, categoria, preco, quantidade, fabricado_em_mari) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const res = await pool.query(query, [nome, marca, categoria, preco, quantidade, fabricado_em_mari]);
        const p = res.rows[0];
        return new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari);
    }

    async listar() {
        const res = await pool.query('SELECT * FROM produto ORDER BY id ASC');
        return res.rows.map(p => new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari));
    }

    async exibir(id) {
        const res = await pool.query('SELECT * FROM produto WHERE id = $1', [id]);
        if (res.rowCount === 0) {
            return null;
        }
        const p = res.rows[0];
        return new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari);
    }

    async alterar(id, nome, marca, categoria, preco, quantidade, fabricado_em_mari) {
        const query = 'UPDATE produto SET nome = $1, marca = $2, categoria = $3, preco = $4, quantidade = $5, fabricado_em_mari = $6 WHERE id = $7 RETURNING *';
        const res = await pool.query(query, [nome, marca, categoria, preco, quantidade, fabricado_em_mari, id]);
        if (res.rowCount === 0) {
            throw new Error("Produto não encontrado.");
        }
        const p = res.rows[0];
        return new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari);
    }

    async remover(id) {
        const res = await pool.query('DELETE FROM produto WHERE id = $1 RETURNING *', [id]);
        if (res.rowCount === 0) {
            throw new Error("Produto não encontrado.");
        }
    }

    async procurarPorNome(nome) {
        const res = await pool.query('SELECT * FROM produto WHERE nome = $1', [nome]);
        return res.rows.map(p => new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari));
    }
}

module.exports = new ProdutoService();
