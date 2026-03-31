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
    console.log("6. Relatórios");
    console.log("7. Cancelar Venda (Procedimento)");
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
                    console.log("\n[ESTOQUE] \n 1.Listar \n 2.Inserir \n 3.Procurar por nome \n 4.Alterar \n 5.Remover \n 6.Exibir um \n 7. Busca por faixa de Preco \n 8. Buscar por Categoria \n 9. Produtos Feitos em Mari \n 10. Verificar Produtos com Menos que 5 Unidades");
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
                        const prodAtual = await g.exibirProduto(id);
                        if (!prodAtual) {
                            console.log("❌ Produto não encontrado.");
                            break;
                        }
                        const n = await rl.question(`Novo Nome (Atual: ${prodAtual.nome}, Enter para manter): `);
                        const m = await rl.question(`Nova Marca (Atual: ${prodAtual.marca}, Enter para manter): `);
                        const c = await rl.question(`Nova Categoria (Atual: ${prodAtual.categoria}, Enter para manter): `);
                        const p = await rl.question(`Novo Preço (Atual: ${prodAtual.preco}, Enter para manter): `);
                        const q = await rl.question(`Nova Qtd (Atual: ${prodAtual.quantidade}, Enter para manter): `);
                        const mariStr = await rl.question(`Fabricado em Mari? (Atual: ${prodAtual.fabricado_em_mari ? 's' : 'n'}, s/n, Enter para manter): `);
                        const mari = mariStr === '' ? undefined : (mariStr.toLowerCase() === 's');
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
                    if (subP == '7') {
                        const inf = await rl.question("Faixa de Preço Inferior: ");
                        const sup = await rl.question("Faixa de Preço Superior: ");
                        const res = await g.procuraFixaPreco(inf, sup);
                        console.table(res);
                    }

                    if (subP == '8') {
                        const c = await rl.question("Digite a Categoria que você quer procurar: ");
                        const res = await g.procuraPorCategoria(c);
                        console.table(res);
                    }

                    if (subP == '9') {
                        console.log("Produtos Feitos em Mari:");
                        console.table(await g.produtosDeMari());
                    }
                    if (subP == '10') {
                        const senha = await rl.question("🔒 Acesso restrito a funcionários. Senha: ");
                        if (senha !== '1234') {
                            console.log("❌ Senha incorreta. Acesso negado.");
                        } else {
                            console.log("Produtos Com Menos de 5 Unidades:");
                            console.table(await g.produtosComMenosdeCinco());
                        }
                    }

                    break;
                case '2': // Clientes
                    console.log("\n[CLIENTES] \n 1.Listar \n 2.Inserir \n 3.Procurar por nome \n 4.Exibir compras \n 5.Alterar \n 6.Remover \n 7.Exibir um");
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
                        const cliAtual = await g.exibirCliente(id);
                        if (!cliAtual) {
                            console.log("❌ Cliente não encontrado.");
                            break;
                        }
                        const n = await rl.question(`Novo Nome (Atual: ${cliAtual.nome}, Enter para manter): `);
                        const cp = await rl.question(`Novo CPF (Atual: ${cliAtual.cpf}, Enter para manter): `);
                        const t = await rl.question(`Novo Tel (Atual: ${cliAtual.telefone}, Enter para manter): `);
                        const cid = await rl.question(`Nova Cidade (Atual: ${cliAtual.cidade}, Enter para manter): `);
                        const fStr = await rl.question(`Flamengo? (Atual: ${cliAtual.torce_flamengo ? 's' : 'n'}, s/n, Enter para manter): `);
                        const f = fStr === '' ? undefined : (fStr.toLowerCase() === 's');
                        const oStr = await rl.question(`One Piece? (Atual: ${cliAtual.assiste_one_piece ? 's' : 'n'}, s/n, Enter para manter): `);
                        const o = oStr === '' ? undefined : (oStr.toLowerCase() === 's');
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
                    console.log("\n[VENDEDORES] \n 1.Listar \n 2.Inserir \n 3.Procurar por nome \n 4.Alterar \n 5.Remover \n 6.Exibir um");
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
                        const vendAtual = await g.exibirVendedor(id);
                        if (!vendAtual) {
                            console.log("❌ Vendedor não encontrado.");
                            break;
                        }
                        const n = await rl.question(`Novo Nome (Atual: ${vendAtual.nome}, Enter para manter): `);
                        const ma = await rl.question(`Nova Matrícula (Atual: ${vendAtual.matricula}, Enter para manter): `);
                        const atStr = await rl.question(`Ativo? (Atual: ${vendAtual.ativo ? 's' : 'n'}, s/n, Enter para manter): `);
                        const at = atStr === '' ? undefined : (atStr.toLowerCase() === 's');
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
                    const vendas = await g.listarVendas();
                    if (vendas.length === 0) {
                        console.log("Nenhuma venda registrada.");
                    } else {
                        vendas.forEach(v => {
                            console.log(`\n🧾 Venda #${v.venda_id} | ${new Date(v.data_venda).toLocaleString('pt-BR')}`);
                            console.log(`   Cliente : ${v.cliente_nome} | ID: ${v.cliente_id}`);
                            console.log(`   Vendedor: ${v.vendedor_nome} | ID: ${v.vendedor_id}`);
                            console.log(`   Bruto: R$ ${parseFloat(v.total_bruto).toFixed(2)} | Desconto: ${v.desconto_percent}% | Líquido: R$ ${parseFloat(v.total_liquido).toFixed(2)}`);
                            console.log(`   Status  : ${v.status}`);
                        });
                    }
                    break;
                case '6': // Relatórios
                    console.log("\n[RELATÓRIOS] 1. Geral 2. Mensal por Vendedor");
                    const subR = await rl.question("Opção: ");
                    if (subR === '1') {
                        const rel = await g.gerarRelatorioGeral();
                        console.log("\n======= RELATÓRIO GERAL =======");
                        console.log(`Produtos: ${rel.qtd_produtos} | Clientes: ${rel.qtd_clientes}`);
                        console.log(`Vendedores: ${rel.qtd_vendedores} | Vendas: ${rel.qtd_vendas}`);
                        console.log(`Faturamento: R$ ${parseFloat(rel.faturamento_total || 0).toFixed(2)}`);
                        console.log("===============================");
                    }
                    if (subR === '2') {
                        const relMensal = await g.gerarRelatorioMensalVendedores();
                        console.log("\n======= RELATÓRIO MENSAL POR VENDEDOR =======");
                        if (relMensal.length === 0) console.log("Nenhuma venda este mês.");
                        else console.table(relMensal);
                        console.log("=============================================");
                    }
                    break;
                case '7': // Cancelar Venda
                    const vIdCan = await rl.question("ID da Venda para CANCELAR: ");
                    await g.cancelarVenda(vIdCan);
                    console.log("✅ Venda Cancelada e Estoque Restaurado (via Procedure)!");
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
