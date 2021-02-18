const Joi = require('@hapi/joi');

const mongoose = require('mongoose');
const Produto = mongoose.model('Produto');
const Variacao = mongoose.model('Variacao');

const show = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    params:{id:Joi.string().alphanum().length(24).required()},
});
const pagar = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    params:{id:Joi.string().alphanum().length(24).required()},
    body:{
        senderHash:Joi.string().required()
    }
})
const update = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    params:{id:Joi.string().alphanum().length(24).required()},
    body:{
        situacao:Joi.string().optional()
    }
});

const checarValorTotal = async ({carrinho, entrega, pagamento}) => {
    try {
        const _carrinho = await Promise.all(carrinho.map(async item => {
            item.produto = await Produto.findById(item.produto);
            item.variacao = await Variacao.findById(item.variacao);    
            return item;
        }));
        let valorTotal = entrega.custo;
        valorTotal += _carrinho.reduce((all, item) => all + (item.quantidade * item.precoUnitario), 0);//Soma o frete ao valor do carrinho
        return (
            valorTotal.toFixed() === pagamento.valor.toFixed() && //toFixed() arredonda o resultado
            (!pagamento.parcelas || pagamento.parcelas <= 6)
            /*  Se o valor total for igual ao pagamento enviado pelo usuário
            e se não tiver parcelas ou o número de parcelas for <= a 6, return true
            */
           );
        } catch(e) {
            console.log(e);
        return false;
    }
}
const checarCartao = (pagamento) => {
    if( pagamento.forma === "creditCard" ) {
        return (
            pagamento.cartao.nomeCompleto && typeof pagamento.cartao.nomeCompleto === "string" && 
            pagamento.cartao.codigoArea && typeof pagamento.cartao.codigoArea === "string" && 
            pagamento.cartao.telefone && typeof pagamento.cartao.telefone === "string" && 
            pagamento.cartao.nascimento && typeof pagamento.cartao.nascimento === "string" && 
            pagamento.cartao.credit_card_token && typeof pagamento.cartao.credit_card_token === "string" && 
            pagamento.cartao.CPF && typeof pagamento.cartao.CPF === "string"
        )
    } else if( pagamento.forma === "boleto" ) return true;
    else return false;
}

module.exports = {checarValorTotal, checarCartao, show, pagar, update};