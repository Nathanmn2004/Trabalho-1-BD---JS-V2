const produtoService = require('./services/ProdutoService');
const clienteService = require('./services/ClienteService');
const vendedorService = require('./services/VendedorService');
const vendaService = require('./services/VendaService');

class GerenciadorDistribuidora {

    // --- PRODUTOS ---
    async inserirProduto(...args) { return produtoService.inserir(...args); }
    async listarProdutos() { return produtoService.listar(); }
    async exibirProduto(id) { return produtoService.exibir(id); }
    async alterarProduto(...args) { return produtoService.alterar(...args); }
    async removerProduto(id) { return produtoService.remover(id); }
    async procuraProdutoporNome(nome) { return produtoService.procurarPorNome(nome); }

    // --- CLIENTES ---
    async inserirCliente(...args) { return clienteService.inserir(...args); }
    async listarClientes() { return clienteService.listar(); }
    async exibirCliente(id) { return clienteService.exibir(id); }
    async alterarCliente(...args) { return clienteService.alterar(...args); }
    async removerCliente(id) { return clienteService.remover(id); }
    async procuraClienteporNome(nome) { return clienteService.procurarPorNome(nome); }
    async exibirComprasporCliente(id) { return clienteService.exibirCompras(id); }

    // --- VENDEDORES ---
    async inserirVendedor(...args) { return vendedorService.inserir(...args); }
    async listarVendedores() { return vendedorService.listar(); }
    async exibirVendedor(id) { return vendedorService.exibir(id); }
    async alterarVendedor(...args) { return vendedorService.alterar(...args); }
    async removerVendedor(id) { return vendedorService.remover(id); }
    async procuraVendedorporNome(nome) { return vendedorService.procurarPorNome(nome); }

    // --- VENDAS & RELATÓRIOS ---
    async realizarVenda(...args) { return vendaService.realizarVenda(...args); }
    async listarVendas() { return vendaService.listarVendas(); }
    async gerarRelatorioGeral() { return vendaService.gerarRelatorioGeral(); }
}

module.exports = GerenciadorDistribuidora;
