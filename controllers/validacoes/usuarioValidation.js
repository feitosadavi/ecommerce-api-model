const  Joi = require('@hapi/joi');

const show = Joi.object({
  query:{loja:Joi.string().alphanum().length(24).required()},
  params:{id:Joi.string().alphanum().length(24).required()}
})

const store = Joi.object({
  body:{
    email:Joi.string().email().required(),
    password:Joi.string().pattern(new RegExp(/(?=^.{8,}$)((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)).required(),
    nome:Joi.string().required(),
    loja:Joi.string().alphanum().length(24).required()
  }
})

const update = Joi.object({
  body:{
    email:Joi.string().email().required(),
    password:Joi.string().pattern(new RegExp(/(?=^.{8,}$)((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)).required(),
    nome:Joi.string().required(),
    loja:Joi.string().alphanum().length(24).required()
  }
})

const remove = Joi.object({
  params:{id:Joi.string().alphanum().length(24).required()}
})

const recoverPass = Joi.object({
  body:{
    email:Joi.string().email().required(),
  }
})

const passRecovered = Joi.object({
  body:{
    password:Joi.string().pattern(new RegExp(/(?=^.{8,}$)((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)).required(),
  }
})

module.exports = {show, store, update, remove,  recoverPass, passRecovered};
