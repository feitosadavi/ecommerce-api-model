const  Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const Produto = mongoose.model("Produto");
const Variacao = mongoose.model("Variacao");
const {calcularFrete} = require('../integracoes/correios');

const show = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    params:{id:Joi.string().alphanum().length(24).required()},
})

const update = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    params:{id:Joi.string().alphanum().length(24).required()},
    body:{
        situacao:Joi.string().optional(),
        codigoRastreamento:Joi.string().optional()
    }
})

const calcular = Joi.object({
    body:{
        cep:Joi.string().required(),
        carrinho:Joi.array().items(Joi.object({
            produto:Joi.string().alphanum().length(24).required(),
            variacao:Joi.string().alphanum().length(24).required(),
            quantidade:Joi.number().required(),
            precoUnitario:Joi.number().required()
        })).required(),//Deve-se usar esta estrutura para um array constituído de vários objetos
    }
})

const checarValorPrazo = async (cep, carrinho, entrega) => {
    try {
        const _carrinho = await Promise.all(carrinho.map(async item => {
            item.produto = await Produto.findById(item.produto);
            item.variacao = await Variacao.findById(item.variacao);
            
            return item;
        }))
        const resultado = await calcularFrete({cep, produtos:_carrinho});
        let found = false;

        resultado.forEach(resultado => {
            if(
                resultado.Codigo === Number(entrega.tipo) &&
                resultado.Valor === entrega.custo.toString().replace('.', ',') &&
                resultado.PrazoEntrega === entrega.prazo.toString()
            ) found = true;
        })
        return found;
    } catch (e) {
        console.log(e);
        return false;
    }
}

module.exports = {calcular, update, show, checarValorPrazo};