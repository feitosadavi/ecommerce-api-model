const  Joi = require('@hapi/joi');

//Funcionou
const index = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required().required()},
});

const validateURLparams = Joi.object({
    params:{id:Joi.string().alphanum().length(24).required().required()},
});
const show = Joi.object({
    params:{id:Joi.string().alphanum().length(24).required().required()},
});

const store = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required().required()},
    body:{
        nome:Joi.string().required(),
        descricao:Joi.string().required(),
        cartegoria:Joi.string().alphanum().length(24).required().required(),
        preco:Joi.number().required(),
        promocao:Joi.number().optional(),
        sku:Joi.string().required(),
    }
});
const update = Joi.object({
    params:{id:Joi.string().alphanum().length(24).required().required()},
    query:{loja:Joi.string().alphanum().length(24).required().required()},
    body:{
        nome:Joi.string().optional(),
        descricao:Joi.string().optional(),
        cartegoria:Joi.string().alphanum().length(24).required().optional(),
        preco:Joi.number().optional(),
        promocao:Joi.number().optional(),
        sku:Joi.string().optional(),
        disponibilidade:Joi.boolean().optional()
    }
});

const remove = Joi.object({
    params:{id:Joi.string().alphanum().length(24).required().required()},
    query:{loja:Joi.string().alphanum().length(24).required().required()},
});

const validateImgs = Joi.object({
    params:{id:Joi.string().alphanum().length(24).required().required()},
});

const search = {
    query:{
        loja:Joi.string().alphanum().length(24).required(),
        limit:Joi.number().optional(),
        offset:Joi.number().optional(),
        sortType:Joi.string().optional()
    },
    params:{search:Joi.string().required()}
}


module.exports = {validateURLparams, index, show, store, update, remove, validateImgs, search};