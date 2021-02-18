const mongoose = require('mongoose');

const Entrega = mongoose.model('Entrega');
const Pedido = mongoose.model('Pedido');
const RegistroPedido = mongoose.model('RegistroPedido');
const Variacao = mongoose.model('Variacao');
const Produto = mongoose.model('Produto');

const {calcularFrete} = require('./integracoes/correios')
const { atualizarPedido } = require('./EmailController');

class EntregaController{

    // GET /:id show
    async show(req, res, next) {
        try {
            const entrega = await Entrega.findOne({loja:req.query.loja, _id:req.params.id});
            const registros = await RegistroPedido.find({pedido:entrega.pedido, tipo:"entrega"});
            res.send({entrega, registros});
        } catch (e) {next(e)}
    }

    // PUT /:id
    async update(req, res, next){
        const {situacao, codigoRastreamento} = req.body;
        const {loja} = req.query;

        try {
            const entrega = await Entrega.findOne({loja, _id:req.params.id});
            console.log(entrega);
            if(situacao) entrega.situacao = situacao;
            if(codigoRastreamento) entrega.codigoRastreamento = codigoRastreamento;
            
            const registroPedido = new RegistroPedido({
                pedido:entrega.pedido,
                tipo:"entrega",
                situacao,
                payload:req.body
            })
            await registroPedido.save();
            await entrega.save();

            atualizarPedido({
                usuario:pedido.cliente.usuario, 
                pedido, 
                tipo:"entrega",
                situacao,
                data:new Data()
            });

            res.send({entrega});
        } catch (e) {next(e)}
    }

    // POST /
    async calcularFrete(req, res, next){
        const {cep, carrinho} = req.body;
        try {
            const _carrinho = await Promise.all(carrinho.map(async item => {
                item.produto = await Produto.findById(item.produto);
                item.variacao = await Variacao.findById(item.variacao);
                return item
            }))
            const resultados = await calcularFrete({cep, produtos:_carrinho});
            return res.send({resultados});
        } catch (e) {next(e)}
    }
}

module.exports = EntregaController;