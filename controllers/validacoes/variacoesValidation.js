const  Joi = require('@hapi/joi');

const validateURL = Joi.object({
    query:{
        loja:Joi.string().alphanum().length(24).required(),
        produto:Joi.string().alphanum().length(24).required()
    },    
    params:{id:Joi.string().alphanum().length(24).required()}
})

const index = Joi.object({
    query:{
        loja:Joi.string().alphanum().length(24).required(),
        produto:Joi.string().alphanum().length(24).required()
    },    
})

const store = Joi.object({
    query:{
        loja:Joi.string().alphanum().length(24).required(),
        produto:Joi.string().alphanum().length(24).required()
    }, 
    body:{
        codigo:Joi.string().required(),
        nome:Joi.string().required(),
        preco:Joi.number().required(),
        promocao:Joi.number().optional(),

    }
})
const update = Joi.object({
    query:{
        loja:Joi.string().alphanum().length(24).required(),
        produto:Joi.string().alphanum().length(24).required()
    },
    params:{id:Joi.string().alphanum().length(24).required()},
    body:{
        codigo:Joi.string().optional(),
        nome:Joi.string().optional(),
        preco:Joi.number().optional(),
        promocao:Joi.number().optional(),

        quantidade:Joi.number().optional()
    }
})

module.exports = {index, validateURL, store, update};