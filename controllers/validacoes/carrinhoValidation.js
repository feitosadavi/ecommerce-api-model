const mongoose = require('mongoose');

const Produto = mongoose.model('Produto');
const Variacao = mongoose.model('Variacao');

const getCarrinhoValue = async (carrinho) => {
    let precoTotal = 0;
    let quantidade = 0;
    carrinho.forEach(item => {
        precoTotal += item.precoUnitario * item.quantidade;//Para cada item o preço total será ele + o preço unitário*quantidade
        quantidade += item.quantidade;
    })
    return {precoTotal, quantidade}
}

const getLojaValue = async (carrinho) => {
    const results = await Promise.all(carrinho.map(async (item) => {
        const produto = await Produto.findById(item.produto);//item.produto refere-se ao produto do carrinho
        const variacao = await Variacao.findById(item.variacao);//item.varicao refere-se a varicao do carrinho
        let preco = 0;
        let qtd = 0;

        if(produto && variacao && produto.variacoes.map(item => item.toString()).includes(variacao._id)){
            /* 
                O map retorna todo ID das variações do produto em String, para poder verificar se inclui o id da variação, de outra
                maneira dá erro. No mais o 2º && diz que se a VARIAÇÃO do PRODUTO existir na collection variações, será true.
                OBS:Lembrando que estamos analisando o id passado pelo carrinho
            */
            let _preco = variacao.promocao || variacao.preco //Se não tiver promoção, será o preço comum
            preco = _preco * item.quantidade;
            qtd = item.quantidade;
        }
        return {preco, qtd};
    }));
    let precoTotal = results.reduce((all, item) => all + item.preco, 0);
    let quantidade = results.reduce((all, item) => all + item.qtd, 0);
    return {precoTotal, quantidade}
}

async function CarrinhoValidation(carrinho){
    const {precoTotal:precoTotalCarrinho, quantidade:quantidadeTotalCarrinho} = await getCarrinhoValue(carrinho);
    const {precoTotal:precoTotalLoja, quantidade:quantidadeTotalLoja} = await getLojaValue(carrinho);
    return precoTotalCarrinho === precoTotalLoja && quantidadeTotalCarrinho === quantidadeTotalLoja;
}

module.exports = CarrinhoValidation;