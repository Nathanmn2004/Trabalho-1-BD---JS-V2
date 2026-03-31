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
        const fields = [];
        const values = [];
        let queryIdx = 1;

        if (nome !== undefined && nome !== '') {
            fields.push(`nome = $${queryIdx++}`);
            values.push(nome);
        }
        if (marca !== undefined && marca !== '') {
            fields.push(`marca = $${queryIdx++}`);
            values.push(marca);
        }
        if (categoria !== undefined && categoria !== '') {
            fields.push(`categoria = $${queryIdx++}`);
            values.push(categoria);
        }
        if (preco !== undefined && preco !== '') {
            fields.push(`preco = $${queryIdx++}`);
            values.push(preco);
        }
        if (quantidade !== undefined && quantidade !== '') {
            fields.push(`quantidade = $${queryIdx++}`);
            values.push(quantidade);
        }
        if (fabricado_em_mari !== undefined && fabricado_em_mari !== '') {
            fields.push(`fabricado_em_mari = $${queryIdx++}`);
            values.push(fabricado_em_mari);
        }

        if (fields.length === 0) {
            return this.exibir(id);
        }

        values.push(id);
        const query = `UPDATE produto SET ${fields.join(', ')} WHERE id = $${queryIdx} RETURNING *`;
        const res = await pool.query(query, values);
        
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


    async procuraFixaPreco(faixaInferior, faixaSuperior){
        const res = await pool.query('SELECT * FROM produto WHERE preco BETWEEN $1 AND $2', [faixaInferior, faixaSuperior]);
        return res.rows.map(p => new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari));
    }


    async procuraPorCategoria(categoria){
        const res = await pool.query('SELECT * FROM produto WHERE categoria = $1', [categoria]);
        return res.rows.map(p => new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari));
    }

    async produtosDeMari(){
        const res = await pool.query('SELECT * FROM produto WHERE fabricado_em_Mari = TRUE');
        return res.rows.map(p => new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari));
    }

    async produtosComMenosdeCinco(){
        const res = await pool.query('SELECT * FROM produto WHERE quantidade < 5');
        return res.rows.map(p => new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari));
    }
}

module.exports = new ProdutoService();
