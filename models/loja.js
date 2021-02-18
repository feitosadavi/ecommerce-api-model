const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const LojaSchema = mongoose.Schema({
  nome: { type: String, required: true },
  cnpj: { type: String, required: true, unique: true },
  email: { type: String },
  telefones: {
    type: [{ type: String }],
  },
  endereco: {
    type: {
      local: { types: String, required: true },
      numero: { type: String, required: true },
      complemento: { type: String },
      bairro: { type: String, required: true },
      cidade: { type: String, required: true },
      estado: { type: String, required: true },
      CEP: { type: String, required: true },
    },
    required: true,
  },
});

LojaSchema.plugin(uniqueValidator, { message: 'já está sendo utilizado' }); //CNPJ/EMAIL

module.exports = mongoose.model('Loja', LojaSchema);
