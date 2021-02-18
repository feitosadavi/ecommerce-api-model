const  Joi = require('@hapi/joi');

const showAdmin = Joi.object({
  query:{loja:Joi.string().alphanum().length(24).required()},
  params:{id:Joi.string().alphanum().length(24).required()},
})

const updateAdmin = Joi.object({
  params:{id:Joi.string().alphanum().length(24).required()},
  query:{loja:Joi.string().alphanum().length(24).required()},
  body:{
    nome:Joi.string().required(),
    CPF:Joi.string().length(14).required(),
    telefones:Joi.array().items(Joi.string().min(8)).required(),
    endereco: Joi.object({
      local:Joi.string().required(),
      numero:Joi.string().required(),
      complemento:Joi.string().required(),
      bairro:Joi.string().required(),
      cidade:Joi.string().required(),
      estado:Joi.string().length(2).required(),
      CEP:Joi.string().length(10).required()
    }).required(),
  }
})

const index = Joi.object({
  query:{loja:Joi.string().alphanum().length(24).required()}
})

const show = Joi.object({
  query:{loja:Joi.string().alphanum().length(24).required()},
  params:{id:Joi.string().alphanum().length(24).required()}
})

const store = Joi.object({
  query:{loja:Joi.string().alphanum().length(24).required()},
  body:{
    email:Joi.string().email().required(),
    password:Joi.string().pattern(new RegExp(/(?=^.{8,}$)((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)).required(),
    nome:Joi.string().required(),
    //nascimento:Joi.date().format("YYYY-MM-DD").raw().required(), FALTA AQUIII
    CPF:Joi.string().length(14).required(),
    telefones:Joi.array().items(Joi.string().min(8)).required(),
    endereco: Joi.object({
      local:Joi.string().required(),
      numero:Joi.string().required(),
      complemento:Joi.string().required(),
      bairro:Joi.string().required(),
      cidade:Joi.string().required(),
      estado:Joi.string().length(2).required(),
      CEP:Joi.string().length(10).required()
    }).required(),
  }
})

const update = Joi.object({
  params:{id:Joi.string().alphanum().length(24).required()},
  query:{loja:Joi.string().alphanum().length(24).required()},
  body:{
    email:Joi.string().email().optional(),
    password:Joi.string().pattern(new RegExp(/(?=^.{8,}$)((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)).optional(),
    nome:Joi.string().optional(),
    //nascimento:Joi.date().format("YYYY-MM-DD").raw().required(), FALTA AQUIII
    CPF:Joi.string().length(14).optional(),
    telefones:Joi.array().items(Joi.string().min(8)).optional(),
    endereco: Joi.object({
      local:Joi.string().optional(),
      numero:Joi.string().optional(),
      complemento:Joi.string().optional(),
      bairro:Joi.string().optional(),
      cidade:Joi.string().optional(),
      estado:Joi.string().length(2).optional(),
      CEP:Joi.string().length(10).optional()
    }).required(),
  }
})

const showPedidosCliente = Joi.object({
  query:{
    offset:Joi.number(),
    limit:Joi.number()
  },  
  params:{id:Joi.string().alphanum().length(24).required()}
})

const search = Joi.object({
  query:{
    offset:Joi.number(),
    limit:Joi.number()
  },
  params:{search:Joi.string().required()}
})

const remove = Joi.object({
  query:{id:Joi.string().alphanum().length(24).required()},
})

module.exports = {index, show, store, update, remove, showAdmin, updateAdmin, search, showPedidosCliente}