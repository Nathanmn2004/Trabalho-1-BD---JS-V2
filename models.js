class Cliente {
    constructor(id, nome, cpf, telefone, cidade, torce_flamengo, assiste_one_piece, criado_em) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.telefone = telefone;
        this.cidade = cidade;
        this.torce_flamengo = torce_flamengo;
        this.assiste_one_piece = assiste_one_piece;
        this.criado_em = criado_em;
    }
}

class Vendedor {
    constructor(id, nome, matricula, ativo) {
        this.id = id;
        this.nome = nome;
        this.matricula = matricula;
        this.ativo = ativo;
    }
}

class Produto {
    constructor(id, nome, marca, categoria, preco, quantidade, fabricado_em_mari) {
        this.id = id;
        this.nome = nome;
        this.marca = marca;
        this.categoria = categoria;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
        this.fabricado_em_mari = fabricado_em_mari;
    }
}

class Venda {
    constructor(id, cliente_id, vendedor_id, data_venda, desconto_percent, total_bruto, total_liquido, status) {
        this.id = id;
        this.cliente_id = cliente_id;
        this.vendedor_id = vendedor_id;
        this.data_venda = data_venda;
        this.desconto_percent = parseFloat(desconto_percent);
        this.total_bruto = parseFloat(total_bruto);
        this.total_liquido = parseFloat(total_liquido);
        this.status = status;
    }
}

class ItemVenda {
    constructor(id, venda_id, produto_id, quantidade, preco_unitario) {
        this.id = id;
        this.venda_id = venda_id;
        this.produto_id = produto_id;
        this.quantidade = parseInt(quantidade);
        this.preco_unitario = parseFloat(preco_unitario);
    }
}

class Pagamento {
    constructor(id, venda_id, tipo, status_confirmacao, codigo_transacao, criado_em) {
        this.id = id;
        this.venda_id = venda_id;
        this.tipo = tipo;
        this.status_confirmacao = status_confirmacao;
        this.codigo_transacao = codigo_transacao;
        this.criado_em = criado_em;
    }
}

module.exports = {
    Cliente,
    Vendedor,
    Produto,
    Venda,
    ItemVenda,
    Pagamento
};
