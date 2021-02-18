const  Joi = require('@hapi/joi');

const index = Joi.object({
    query:{
        produto:Joi.string().alphanum().length(24).required(),
        loja:Joi.string().alphanum().length(24).required()
    }
})

const show = Joi.object({
    query:{
        loja:Joi.string().alphanum().length(24).required(),
        produto:Joi.string().alphanum().length(24).required()
    },
    params:{id:Joi.string().alphanum().length(24).required()}
})

const store = Joi.object({
    body:{
        nome:Joi.string().required(),
        texto:Joi.string().required(),
        pontuacao:Joi.number().min(1).max(5).required()
    }
})
const remove = Joi.object({
    params:{id:Joi.string().alphanum().length(24).required()}

})

module.exports = {index, show, store, remove};
