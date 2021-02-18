const  JoiBase = require('@hapi/joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate)

const validateURLparams = Joi.object({
    params:{id:Joi.string().alphanum().length(24).required()}
})

const validateURL = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    params:{id:Joi.string().alphanum().length(24).required()}
})

const store = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    body:{
        carrinho:Joi.array().items(Joi.object({
            produto:Joi.string().alphanum().length(24).required(),
            variacao:Joi.string().alphanum().length(24).required(),
            quantidade:Joi.number().required(),
            precoUnitario:Joi.number().required()
        })),//Deve-se usar esta estrutura para um array constituído de vários objetos
        pagamento:Joi.object({
            valor: Joi.number(),
            forma: Joi.string(),
            parcelas:Joi.number().optional(),
            enderecoEntregaCobranca:Joi.boolean().required(),
            endereco: Joi.object({
                local:Joi.string().required(),
                numero:Joi.string().required(),
                complemento:Joi.string().required(),
                bairro:Joi.string().required(),
                cidade:Joi.string().required(),
                estado:Joi.string().length(2).required(),
                CEP:Joi.string().length(8).required()
              }).required(),
            cartao:Joi.object({
                nomeCompleto:Joi.string().required(),
                codigoArea:Joi.string().required(),
                telefone:Joi.string().required(),
                nascimento:Joi.date().format("DD/MM/YYYY").raw().required(),
                credit_card_token:Joi.string().required(),
                CPF:Joi.string().length(11).required(),
            }).optional(),
        }).required(),
        entrega:Joi.object({
            custo: Joi.number().required(),
            prazo: Joi.number().required(),
            tipo:Joi.string().required(),
            endereco: Joi.object({
                local:Joi.string().required(),
                numero:Joi.string().required(),
                complemento:Joi.string().required(),
                bairro:Joi.string().required(),
                cidade:Joi.string().required(),
                estado:Joi.string().length(2).required(),
                CEP:Joi.string().length(8).required()
              }).required(),
        }).required(),  
    }
})

const validateURLindex = Joi.object({
    query:{
        offset:Joi.number(),
        limit:Joi.number(),
        loja:Joi.string().alphanum().length(24).required()
    }
})

module.exports = {validateURLparams, validateURL, validateURLindex, store};
