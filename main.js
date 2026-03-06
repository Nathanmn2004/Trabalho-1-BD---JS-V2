const readline = require('readline/promises');
const pool = require('./db');
const GerenciadorDistribuidora = require('./gerenciador');

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
                    console.log("\n[ESTOQUE] 1.Listar 2.Inserir 3.Procurar por nome 4.Alterar 5.Remover 6.Exibir um");
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
                    if (subP === '3') {
                        const n = await rl.question("Nome: ");
                        const res = await g.procuraProdutoporNome(n);
                        console.table(res);
                    }
                    if (subP === '4') {
                        const id = await rl.question("ID do Produto para Alterar: ");
                        const n = await rl.question("Novo Nome: ");
                        const m = await rl.question("Nova Marca: ");
                        const c = await rl.question("Nova Categoria: ");
                        const p = await rl.question("Novo Preço: ");
                        const q = await rl.question("Nova Qtd: ");
                        const mari = (await rl.question("Fabricado em Mari? (s/n): ")) === 's';
                        await g.alterarProduto(id, n, m, c, p, q, mari);
                        console.log("✅ Produto Alterado com Sucesso!");
                    }
                    if (subP === '5') {
                        const id = await rl.question("ID do Produto para Remover: ");
                        await g.removerProduto(id);
                        console.log("✅ Produto Removido com Sucesso!");
                    }
                    if (subP === '6') {
                        const id = await rl.question("ID do Produto: ");
                        const res = await g.exibirProduto(id);
                        if (res) console.table([res]);
                        else console.log("❌ Produto não encontrado.");
                    }
                    break;
                case '2': // Clientes
                    console.log("\n[CLIENTES] 1.Listar 2.Inserir 3.Procurar por nome 4.Exibir compras 5.Alterar 6.Remover 7.Exibir um");
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
                    if (subC === '3') {
                        const n = await rl.question("Nome: ");
                        const res = await g.procuraClienteporNome(n);
                        console.table(res);
                    }
                    if (subC === '4') {
                        const id = await rl.question("ID do Cliente: ");
                        const res = await g.exibirComprasporCliente(id);
                        console.table(res);
                    }
                    if (subC === '5') {
                        const id = await rl.question("ID do Cliente para Alterar: ");
                        const n = await rl.question("Novo Nome: ");
                        const cp = await rl.question("Novo CPF: ");
                        const t = await rl.question("Novo Tel: ");
                        const cid = await rl.question("Nova Cidade: ");
                        const f = (await rl.question("Flamengo? (s/n): ")) === 's';
                        const o = (await rl.question("One Piece? (s/n): ")) === 's';
                        await g.alterarCliente(id, n, cp, t, cid, f, o);
                        console.log("✅ Cliente Alterado com Sucesso!");
                    }
                    if (subC === '6') {
                        const id = await rl.question("ID do Cliente para Remover: ");
                        await g.removerCliente(id);
                        console.log("✅ Cliente Removido com Sucesso!");
                    }
                    if (subC === '7') {
                        const id = await rl.question("ID do Cliente: ");
                        const res = await g.exibirCliente(id);
                        if (res) console.table([res]);
                        else console.log("❌ Cliente não encontrado.");
                    }
                    break;
                case '3': // Vendedores
                    console.log("\n[VENDEDORES] 1.Listar 2.Inserir 3.Procurar por nome 4.Alterar 5.Remover 6.Exibir um");
                    const subV = await rl.question("Opção: ");
                    if (subV === '1') console.table(await g.listarVendedores());
                    if (subV === '2') {
                        const n = await rl.question("Nome: ");
                        const ma = await rl.question("Matrícula: ");
                        const res = await g.inserirVendedor(n, ma, true);
                        console.log("✅ Vendedor Inserido com ID Automático:", res.id);
                    }
                    if (subV === '3') {
                        const n = await rl.question("Nome: ");
                        const res = await g.procuraVendedorporNome(n);
                        console.table(res);
                    }
                    if (subV === '4') {
                        const id = await rl.question("ID do Vendedor para Alterar: ");
                        const n = await rl.question("Novo Nome: ");
                        const ma = await rl.question("Nova Matrícula: ");
                        const at = (await rl.question("Ativo? (s/n): ")) === 's';
                        await g.alterarVendedor(id, n, ma, at);
                        console.log("✅ Vendedor Alterado com Sucesso!");
                    }
                    if (subV === '5') {
                        const id = await rl.question("ID do Vendedor para Remover: ");
                        await g.removerVendedor(id);
                        console.log("✅ Vendedor Removido com Sucesso!");
                    }
                    if (subV === '6') {
                        const id = await rl.question("ID do Vendedor: ");
                        const res = await g.exibirVendedor(id);
                        if (res) console.table([res]);
                        else console.log("❌ Vendedor não encontrado.");
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
                case '0':
                    loop = false;
                    break;
            }
        } catch (err) { console.error("\n❌ ERRO:", err.message); }
    }
    await pool.end(); rl.close();
}

main();
