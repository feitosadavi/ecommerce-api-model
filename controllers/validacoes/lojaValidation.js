const mongoose = require('mongoose');
const  Joi = require('@hapi/joi');

const Usuario = mongoose.model('Usuario');
//const Loja = mongoose.model('Loja');

const index = Joi.object({
  query:{loja:Joi.string().alphanum().length(24).required()},
})

const show = Joi.object({
  query:{loja:Joi.string().alphanum().length(24).required()},
  params:{id:Joi.string().alphanum().length(24).required()}
})

const store = Joi.object({
  body:{
    email:Joi.string().email().required(),
    nome:Joi.string().required(),
    cnpj:Joi.string().length(18).required(),
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
});

const update = Joi.object({
  params:{id:Joi.string().alphanum().length(24).required()},
  query:{loja:Joi.string().alphanum().length(24).required()},
  body:{
    email:Joi.string().email().optional(),
    nome:Joi.string().optional(),
    cnpj:Joi.string().length(18).optional(),
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
});

const remove = Joi.object({
  query:{loja:Joi.string().alphanum().length(24).required()},
})

const admin = (req, res, next) => {
  if (!req.payload.id) return res.sendStatus(401);
  const { loja } = req.query;
  if (!loja) return res.sendStatus(401);
  Usuario.findById(req.payload.id)
    .then((usuario) => {
      if (!usuario) return res.sendStatus(401);
      if (!usuario.loja) return res.sendStatus(401);
      if (!usuario.permissao.includes('admin')) return res.sendStatus(401);
      if (usuario.loja.toString() !== loja) return res.sendStatus(401);
      next();
    }).catch(next);
}

module.exports = { admin, index, show, store, update, remove };
