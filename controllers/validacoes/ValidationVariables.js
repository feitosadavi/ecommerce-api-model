const Joi = require('joi');

const string = Joi.string();
const number = Joi.number();
const alphanum24 = Joi.string().alphanum().length(24).length(24);//Valida id's
const boolean = Joi.boolean();

const codigo = Joi.string();
const produtos = Joi.array().items(Joi.string().alphanum().length(24)).optional();

const ValidationVariables = {
    string,
    number,
    boolean,
    codigo,
    produtos,
    alphanum24   
}


module.exports = ValidationVariables;