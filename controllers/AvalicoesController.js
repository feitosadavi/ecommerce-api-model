const mongoose = require("mongoose");

const Avaliacao = mongoose.model('Avaliacao');
const Produto = mongoose.model('Produto');

class AvaliacoesController{

    // GET /
    async index(req, res, next){
        try {
            const {loja, produto} = req.query;
            const avaliacoes = await Avaliacao.find({loja, produto});
            return res.send({avaliacoes});
        } catch (e) {next(e)}
    }

    // GET /:id
    async show(req, res, next){
        const {loja, produto} = req.query;
        const {id:_id} = req.params;
        try {
            const avaliacoes = await Avaliacao.findOne({_id, loja, produto});
            return res.send({avaliacoes});
        } catch (e) {next(e)}
    }

    // POST /
    async store(req, res, next){
        const {nome, texto, pontuacao} = req.body;
        const {loja, produto} = req.query;
        try {
            const avaliacao = new Avaliacao({nome, texto, pontuacao, loja, produto})

            const _produto = await Produto.findById(produto);
            _produto.avaliacoes.push(avaliacao._id);

            await _produto.save();
            await avaliacao.save();
            res.send({avaliacao});
        } catch (e) {next(e)}
    }

    // DELETE /:id
    async remove(req, res, next){
        try {
            const avaliacao = await Avaliacao.findById(req.params.id);
            const produto = await Produto.findById(avaliacao.produto);
            produto.avaliacoes.filter(item => item.toString() !== avaliacao._id.toString());
            /**
             * FIltra os valores das avaliacoes em produto, buscando manter somente
             * aqueles que são diferentes do id passado nos parâmetro
            */
            await produto.save();            
            await avaliacao.remove();
            res.send({deletado:true});
        } catch (e) {next(e)}
    }
}

module.exports = AvaliacoesController;