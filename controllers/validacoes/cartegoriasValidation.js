const  Joi = require('@hapi/joi');

const index = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()}
})

const indexDisponiveis = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    params:{id:Joi.string().alphanum().length(24).required()}
})

const show = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    params:{id:Joi.string().alphanum().length(24).required()}
})

const store = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    body:{
        nome:Joi.string().required(),
        codigo:Joi.string().required(),
    }
})

const update = Joi.object({
    query:{loja:Joi.string().alphanum().length(24).required()},
    params:{id:Joi.string().alphanum().length(24).required()},
    body:{
        nome:Joi.string().optional(),
        disponibilidade:Joi.boolean().optional(),
        codigo:Joi.string().optional(),
        produtos:Joi.array().items(Joi.string().alphanum().length(24)).optional(),
    }
})

const remove = Joi.object({
    params:{id:Joi.string().alphanum().length(24).required()}
})

module.exports = {index, indexDisponiveis, show, store, update, remove};