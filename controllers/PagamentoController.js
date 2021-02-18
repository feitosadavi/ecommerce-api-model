const mongoose = require('mongoose');
const {criarPagamento, getSessionId, getTransactionStatus, getNotification} = require("./integracoes/pagseguro");

const Pagamento = mongoose.model("Pagamento");
const Pedido = mongoose.model("Pedido");
const Variacao = mongoose.model("Variacao");
const Produto = mongoose.model("Produto");
const RegistroPedido = mongoose.model("RegistroPedido");
const { atualizarPedido } = require('./EmailController');
const { atualizarQuantidade } = require('./validacoes/quantidadeValidation');

class PagamentoController {
    
    //CLIENTES
    async show(req, res, next){
        try {
            const pagamento = await Pagamento.findOne({_id:req.params.id, loja:req.query.loja});
            if(!pagamento) return res.status(400).send({error:"Pagamento não existe"});

            const registros = await RegistroPedido.find({pedido:pagamento.pedido})

            const situacao = (pagamento.pagSeguroCode) ? await getTransactionStatus(pagamento.pagSeguroCode) : null;
            if(
                situacao && 
                (
                    registros.length === 0 || // se for o primeiro registro
                    !registros[registros.length - 1].payload ||//Se o último registro não tiver payload
                    !registros[registros.length - 1].payload.code ||//Se o último registro não tiver payload.code
                    registros[registros.length - 1].payload.code !== situacao.code // se houve atualização no status do pagamento...
                )
            ){
                const registroPedido = new RegistroPedido({
                    pedido: pagamento.pedido,
                    tipo:"pagamento",
                    situacao:situacao.status || "Situacao",
                    payload: situacao
                });
                pagamento.situacao = situacao.status;
                await pagamento.save();
                await registroPedido.save();
                registros.push(registroPedido)
            }
            return res.send({pagamento, registros, situacao});
        } catch (e) {next(e)}
    }

    async pagar(req, res, next){
        const {senderHash} = req.body;

        try {
            const pagamento = await Pagamento.findOne({_id:req.params.id, loja:req.query.loja});
            if(!pagamento) return res.status(400).send({error:"Pagamento não existe"});
            const pedido = await Pedido.findById(pagamento.pedido).populate([
                {path:"cliente", populate:"usuario"},
                {path:"entrega"},
                {path:"pagamento"},
            ]);

            pedido.carrinho = await Promise.all(pedido.carrinho.map(async item => {
                item.pedido = await Pedido.findById(item.pedido);
                item.variacao = await Variacao.findById(item.variacao);
                const produto = await Produto.findById(item.variacao.produto);
                item.nomeProduto = produto.nome;
                return item;
            }));
    
            const payload = await criarPagamento(senderHash, pedido);
            pagamento.payload = (pagamento.payload) ? pagamento.payload.concat([payload]) : [payload];

            if(payload.code) pagamento.pagSeguroCode = payload.code;
            await pagamento.save();

            return res.send({pagamento});
        } catch (e) {next(e)}
    }

    // ADMIN
    async update(req, res, next){
        const {situacao} = req.body;

        try {
            const pagamento = await Pagamento.findOne({_id:req.params.id, loja:req.query.loja});
            if(!pagamento) return res.status(400).send({error:"Pagamento não existe"});

            if(situacao) pagamento.situacao = situacao;

            const registroPedido = new RegistroPedido({
                pedido: pagamento.pedido,
                tipo:"pagamento",
                situacao:situacao,
            });

            await pagamento.save();
            await registroPedido.save();

            const pedido = await Pedido.findById(pagamento.pedido).populate({path:"cliente", populate:"usuario"});
            atualizarPedido({
                usuario:pedido.cliente.usuario, 
                pedido, 
                tipo:"pagamento",
                situacao,
                data:new Date()
            });

            if(pagamento.situacao.toLowerCase().includes("paga")) await atualizarQuantidade("confirmar_pedido", pedido);
            else if(pagamento.situacao.toLowerCase().includes("cancelada")) await atualizarQuantidade("cancelar_pedido", pedido);

            return res.send({pagamento});

        } catch (e) {next(e)}
    }

    //PAGSEGURO
    async getSessionId(req, res, next){
        try {
            const sessionId = await getSessionId();
            return res.send({sessionId});
        } catch (e) {next(e)}
    }

    async verNotificacao(req, res, next){
        try {
            const {notificationCode, notificationType} = req.body;
            if(notificationType !== "transaction") return res.send({success:true})// quer dizer que não é um notificação relacionada ao pagamento

            const result = await getNotification(notificationCode);

            const pagamento = await Pagamento.findOne({pagSeguroCode:result.code});
            if(!pagamento) return res.status(400).send({error:"Pagamento não existe"});

            const registros = await RegistroPedido.find({pedido:pagamento.pedido})

            const situacao = (pagamento.pagSeguroCode) ? await getTransactionStatus(pagamento.pagSeguroCode) : null;

            if(
                situacao && 
                (
                    registros.length === 0 || // se for o primeiro registro
                    registros[registros.length - 1] !== situacao.code // se houve atualização no status do pagamento...
                )
            ){
                const registroPedido = new RegistroPedido({
                    pedido: pagamento.pedido,
                    tipo:"pagamento",
                    situacao:situacao.status || "Situacao",
                    payload: situacao
                });
                pagamento.situacao = situacao.status;

                await pagamento.save();
                await registroPedido.save();

                const pedido = await Pedido.findById(pagamento.pedido).populate({path:"cliente", populate:"usuario"});
                atualizarPedido({
                    usuario:pedido.cliente.usuario, 
                    pedido, 
                    tipo:"Atualização no pagamento",
                    situacao:pagamento.situacao,
                    data:new Date()
                })
                if(pagamento.situacao.toLowerCase().includes("paga")) await atualizarQuantidade("confirmar_pedido", pedido);
                else if(pagamento.situacao.toLowerCase().includes("cancelada")) await atualizarQuantidade("cancelar_pedido", pedido);
            }
            return res.send({success:true});

        } catch (e) {next(e)}
    }
}

module.exports = PagamentoController;
