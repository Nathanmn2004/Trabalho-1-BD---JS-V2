require('dotenv').config();
const { Pool } = require('pg');
const readline = require('readline/promises');

// Configuração do Pool de Conexão
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    options: `-c search_path=${process.env.DB_SCHEMA}`
});

// ====== CLASSES DE MODELAGEM (Mapeamento de Tabelas) ======

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

// ====== CLASSE DE GERENCIAMENTO ======

class GerenciadorDistribuidora {

    // --- PRODUTOS ---
    async inserirProduto(nome, marca, categoria, preco, quantidade, fabricado_em_mari) {
        const query = 'INSERT INTO produto (nome, marca, categoria, preco, quantidade, fabricado_em_mari) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const res = await pool.query(query, [nome, marca, categoria, preco, quantidade, fabricado_em_mari]);
        const p = res.rows[0];
        return new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari);
    }

    async listarProdutos() {
        const res = await pool.query('SELECT * FROM produto ORDER BY id ASC');
        return res.rows.map(p => new Produto(p.id, p.nome, p.marca, p.categoria, p.preco, p.quantidade, p.fabricado_em_mari));
    }

    // --- CLIENTES ---
    async inserirCliente(nome, cpf, telefone, cidade, torce_flamengo, assiste_one_piece) {
        const query = 'INSERT INTO cliente (nome, cpf, telefone, cidade, torce_flamengo, assiste_one_piece) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const res = await pool.query(query, [nome, cpf, telefone, cidade, torce_flamengo, assiste_one_piece]);
        const c = res.rows[0];
        return new Cliente(c.id, c.nome, c.cpf, c.telefone, c.cidade, c.torce_flamengo, c.assiste_one_piece, c.criado_em);
    }

    async listarClientes() {
        const res = await pool.query('SELECT * FROM cliente ORDER BY nome ASC');
        return res.rows.map(c => new Cliente(c.id, c.nome, c.cpf, c.telefone, c.cidade, c.torce_flamengo, c.assiste_one_piece, c.criado_em));
    }

    // --- VENDEDORES ---
    async inserirVendedor(nome, matricula, ativo) {
        const query = 'INSERT INTO vendedor (nome, matricula, ativo) VALUES ($1, $2, $3) RETURNING *';
        const res = await pool.query(query, [nome, matricula, ativo]);
        const v = res.rows[0];
        return new Vendedor(v.id, v.nome, v.matricula, v.ativo);
    }

    async listarVendedores() {
        const res = await pool.query('SELECT * FROM vendedor WHERE ativo = true ORDER BY nome ASC');
        return res.rows.map(v => new Vendedor(v.id, v.nome, v.matricula, v.ativo));
    }

    // --- VENDA (TRANSACIONAL) ---
    async realizarVenda(clienteId, vendedorId, itens, tipoPagamento) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const resCli = await client.query('SELECT torce_flamengo, assiste_one_piece, cidade FROM cliente WHERE id = $1', [clienteId]);
            if (resCli.rowCount === 0) throw new Error("Cliente não encontrado.");
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
                if (resProd.rowCount === 0) throw new Error(`Produto ${itemData.produtoId} não existe.`);
                const prod = resProd.rows[0];

                if (prod.quantidade < itemData.qtd) throw new Error(`Estoque insuficiente para ${prod.nome}.`);

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

            // Atualizar objeto local
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

// ====== CLI INTERFACE ======

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const g = new GerenciadorDistribuidora();

async function menu() {
    console.log("\n--- DISTRIBUIDORA 2.0 (SISTEMA INTEGRADO) ---");
    console.log("1. Gestão de Produtos");
    console.log("2. Gestão de Clientes");
    console.log("3. Gestão de Vendedores");
    console.log("4. REALIZAR VENDA (PDV)");
    console.log("5. Listar Vendas Realizadas");
    console.log("6. Relatório Geral");
    console.log("0. Sair");
    return await rl.question("Escolha: ");
}

async function main() {
    let loop = true;
    while (loop) {
        const opt = await menu();
        try {
            switch (opt) {
                case '1': // Produtos
                    console.log("\n[ESTOQUE] 1.Listar 2.Inserir");
                    const subP = await rl.question("Opção: ");
                    if (subP === '1') console.table(await g.listarProdutos());
                    if (subP === '2') {
                        const n = await rl.question("Nome: ");
                        const m = await rl.question("Marca: ");
                        const c = await rl.question("Categoria: ");
                        const p = await rl.question("Preço: ");
                        const q = await rl.question("Qtd: ");
                        const mari = (await rl.question("Fabricado em Mari? (s/n): ")) === 's';
                        const res = await g.inserirProduto(n, m, c, p, q, mari);
                        console.log("✅ Produto Inserido com ID Automático:", res.id);
                    }
                    break;
                case '2': // Clientes
                    console.log("\n[CLIENTES] 1.Listar 2.Inserir");
                    const subC = await rl.question("Opção: ");
                    if (subC === '1') console.table(await g.listarClientes());
                    if (subC === '2') {
                        const n = await rl.question("Nome: ");
                        const cp = await rl.question("CPF: ");
                        const t = await rl.question("Tel: ");
                        const cid = await rl.question("Cidade: ");
                        const f = (await rl.question("Flamengo? (s/n): ")) === 's';
                        const o = (await rl.question("One Piece? (s/n): ")) === 's';
                        const res = await g.inserirCliente(n, cp, t, cid, f, o);
                        console.log("✅ Cliente Inserido com ID Automático:", res.id);
                    }
                    break;
                case '3': // Vendedores
                    console.log("\n[VENDEDORES] 1.Listar 2.Inserir");
                    const subV = await rl.question("Opção: ");
                    if (subV === '1') console.table(await g.listarVendedores());
                    if (subV === '2') {
                        const n = await rl.question("Nome: ");
                        const ma = await rl.question("Matrícula: ");
                        const res = await g.inserirVendedor(n, ma, true);
                        console.log("✅ Vendedor Inserido com ID Automático:", res.id);
                    }
                    break;
                case '4': // PDV
                    console.log("\n--- REALIZAR VENDA (PDV) ---");
                    const cId = await rl.question("ID do Cliente: ");
                    const vId = await rl.question("ID do Vendedor: ");

                    const itensVenda = [];
                    let adicionandoItens = true;

                    while (adicionandoItens) {
                        const pId = await rl.question("ID do Produto: ");
                        const qtd = await rl.question("Quantidade: ");

                        itensVenda.push({ produtoId: pId, qtd: parseInt(qtd) });

                        const continua = (await rl.question("Deseja adicionar mais um produto? (s/n): ")).toLowerCase();
                        if (continua !== 's') {
                            adicionandoItens = false;
                        }
                    }

                    const pagInput = await rl.question("Pagamento (CARTAO, BOLETO, PIX, BERRIES): ");

                    const resultado = await g.realizarVenda(cId, vId, itensVenda, pagInput.toUpperCase());
                    console.log(`\n💰 VENDA EFETIVADA!`);
                    console.log(`Venda ID: ${resultado.venda.id} | Total Líquido: R$ ${resultado.venda.total_liquido.toFixed(2)}`);
                    console.log(`Itens registrados: ${resultado.itens.length}`);
                    console.log(`Pagamento registrado via: ${resultado.pagamento.tipo}`);
                    break;
                case '5': // Listar Vendas
                    console.log("\n--- VENDAS REALIZADAS ---");
                    console.table(await g.listarVendas());
                    break;
                case '6': // Relatório
                    const rel = await g.gerarRelatorioGeral();
                    console.log("\n======= RELATÓRIO GERAL =======");
                    console.log(`Produtos: ${rel.qtd_produtos} | Clientes: ${rel.qtd_clientes}`);
                    console.log(`Vendedores: ${rel.qtd_vendedores} | Vendas: ${rel.qtd_vendas}`);
                    console.log(`Faturamento: R$ ${parseFloat(rel.faturamento_total || 0).toFixed(2)}`);
                    console.log("===============================");
                    break;
                case '0': loop = false; break;
            }
        } catch (err) { console.error("\n❌ ERRO:", err.message); }
    }
    await pool.end(); rl.close();
}

main();
