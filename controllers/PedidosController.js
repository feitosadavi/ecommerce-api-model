const mongoose = require('mongoose');

const Pedido = mongoose.model("Pedido");
const Cliente = mongoose.model("Cliente");
const Usuario = mongoose.model("Usuario");
const Produto = mongoose.model("Produto");
const Variacao = mongoose.model("Variacao");
const Pagamento = mongoose.model("Pagamento");
const Entrega = mongoose.model("Entrega");
const RegistroPedido = mongoose.model("RegistroPedido");

const CarrinhoValidation = require('./validacoes/carrinhoValidation');
const { checarValorPrazo } = require('./validacoes/entregaValidation');
const {checarValorTotal, checarCartao} = require('./validacoes/pagamentoValidation');
const  {validarQuantidadeDisponivel, atualizarQuantidade} = require('./validacoes/quantidadeValidation');

const {cancelarPedido, enviarNovoPedido} = require('./EmailController');

class PedidoController {

    /**
     * ADMIN
     */

    //GET /
    async indexAdmin(req, res, next){
        const {offset, limit, loja} = req.query;
        try {
            const pedidos = await Pedido.paginate(
                {loja}, 
                {
                    offset:Number(offset || 0), 
                    limit:Number(limit || 30), 
                    populate:["cliente", "pagamentos", "entrega"]
                }
            );   
            pedidos.docs = await Promise.all(pedidos.docs.map(async (pedido) => {
                pedido.carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
                    item.produto = await Produto.findById(item.produto);
                    item.variacao = await Variacao.findById(item.variacao);
                    return item
                }));
                return pedido;
            }));
            res.send({pedidos});

        } catch (e) {next(e)}

    }
    //GET /:id
    async showAdmin(req, res, next) {
        const {loja} = req.query;
        const {id:_id} = req.params;
        try {
            const pedido = await Pedido.findOne({loja, _id}).populate(["cliente", "pagamento", "entrega"]);
            if(!pedido) return res.status(400).send({errors:"Pedido não encontrado"});

            pedido.carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
                item.produto = await Produto.findById(item.produto);
                item.variacao = await Variacao.findById(item.variacao);
                return item
            }));

            const registros = await RegistroPedido.find({pedido:pedido._id});
            res.send({pedido, registros});
        } catch (e) {next(e)}
    }
    //DELETE /remove/:id
    async removeAdmin(req, res, next) {
        try{
            const pedido = await Pedido.findOne({loja:req.query.loja, _id:req.params.id})
            .populated({ path:"Cliente", populate:"Usuario" });

            if(!pedido) return res.status(400).send({errors:"Pedido não encontrado"});

            pedido.cancelado = true;

            const registroPedido = new RegistroPedido({
                pedido:pedido._id,
                tipo:"pedido",
                situacao:"pedido_cancelado_pelo_admin"
            });
            
            await pedido.save();
            await atualizarQuantidade("cancelar_pedido", pedido);
            await registroPedido.save();
            cancelarPedido({usuario: pedido.cliente.usuario, pedido})

            res.send({cancelado:true});
        } catch (e) {next(e)}
    }
    //GET /:id/carrinho
    async showClienteCarrinhoAdmin(req, res, next){
        const {loja} = req.query;
        const {id:_id} = req.params;
        try {
            const pedido = await Pedido.findOne({loja, _id});
            if(!pedido) return res.status(400).send({errors:"Pedido não encontrado"});

            pedido.carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
                item.produto = await Produto.findById(item.produto);
                item.variacao = await Variacao.findById(item.variacao);
                return item;
            }));

            res.send({carrinho:pedido.carrinho});
        } catch (e) {next(e)}
    }

    /**
    * CLIENTE
    */
    // GET /
    async index(req, res, next){
        const {offset, limit, loja} = req.query;
        try {
            const cliente = await Cliente.findOne({usuario:req.payload.id})
            const pedidos = await Pedido.paginate(
                {loja, cliente:cliente._id}, 
                {
                    offset:Number(offset || 0), 
                    limit:Number(limit || 30), 
                    populate:["cliente", "pagamentos", "entrega"]
                }
            );   
            pedidos.docs = await Promise.all(pedidos.docs.map(async (pedido) => {
                pedido.carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
                    item.produto = await Produto.findById(item.produto);
                    item.variacao = await Variacao.findById(item.variacao);
                    return item;
                }));
                return pedido;
            }));
            res.send({pedidos});

        } catch (e) {next(e)}
    }
    
    // GET /:id
    async show(req, res, next) {
        const {id:_id} = req.params;
        try {
            const cliente = await Cliente.findOne({usuario:req.payload.id})
            const pedido = await Pedido.findOne({cliente:cliente._id, _id}).populate(["cliente", "pagamento", "entrega"]);
            if(!pedido) return res.status(400).send({errors:"Pedidos não encontrado"});
            pedido.carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
                item.produto = await Produto.findById(item.produto);
                item.variacao = await Variacao.findById(item.variacao);
                return item;
            }));

            const registros = await RegistroPedido.find({pedido:pedido._id});

            res.send({pedido, registros});
        } catch (e) {next(e)}
    }
    // GET /:id/carrinho
    async showCarrinho(req, res, next){
        try {
            const pedido = await Pedido.findById(req.params.id);
            if(!pedido) return res.status(400).send({errors:"Carrinho vazio :("});

            pedido.carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
                item.variacao = await Variacao.findById(item.variacao);
                item.produto = await Produto.findById(item.produto);

                return item;
            }))

            res.send({carrinho:pedido.carrinho})
        } catch (e) {next(e)}
    }

    // POST /enviar
    async store(req, res, next){
        const {carrinho, pagamento, entrega} = req.body;
        const {loja} = req.query;
        const _carrinho = carrinho.slice();
        try {
            // CHECAR DADOS DO CARRINHO 
            if(!await CarrinhoValidation(carrinho)) return res.status(422).send({errors:"Carrinho inválido!"});

            if(!await validarQuantidadeDisponivel(carrinho)) return res.status(400).send({errors:"Quantidade indisponível"})

            const cliente = await Cliente.findOne({usuario:req.payload.id}).populate({path:"usuario", select:"_id nome email"});

            // CHECAR DADOS DO ENTREGA 
            if(!await checarValorPrazo(cliente.endereco.CEP, carrinho, entrega)) return res.status(422).send({errors:"Dados de Entrega inválidos!"});
            
            // CHECAR DADOS DO PAGAMENTO 
            if(!await checarValorTotal({carrinho, entrega, pagamento})) return res.status(422).send({errors:"Dados de Pagamento inválidos!"});
            if(!checarCartao(pagamento)) return res.status(422).send({errors:"Dados de Pagamento com cartão inválidos!"});

            const novoPagamento = new Pagamento({
                situacao: "iniciando",
                valor: pagamento.valor,
                parcelas:pagamento.parcelas || 1,
                forma: pagamento.forma,
                endereco:pagamento.endereco,
                cartao:pagamento.cartao,
                enderecoEntregaIgualCobranca:pagamento.enderecoEntregaIgualCobranca,
                loja
            });

            const novaEntrega = new Entrega({
                situacao:"Não iniciado",
                custo: entrega.custo,
                prazo: entrega.prazo,
                tipo:entrega.tipo,
                endereco:entrega.endereco,
                loja
            });

            const pedido = new Pedido({
                cliente: cliente._id,
                carrinho: _carrinho,
                pagamento:novoPagamento._id,
                entrega:novaEntrega._id,
                loja
            })
            novoPagamento.pedido = pedido._id;
            novaEntrega.pedido = pedido._id;

            enviarNovoPedido({ pedido, usuario: cliente.usuario })
            const administradores = await Usuario.find({ permissao: "admin", loja })
            administradores.forEach(usuario => {
                enviarNovoPedido({ pedido, usuario })
            })

            await pedido.save();
            await novoPagamento.save();
            await novaEntrega.save();

            await atualizarQuantidade("adicionar_pedido", pedido);

            const registroPedido = new RegistroPedido({
                pedido:pedido._id,
                tipo:"pedido",
                situacao:"pedido_criado"
            })
            await registroPedido.save();


            return res.send({pedido:Object.assign({}, pedido._doc, {entrega:novaEntrega, pedido:novoPagamento, cliente})})
            
        } catch (e) {next(e)}
    }

    //DELETE /remover/:id
    async remove(req, res, next) {
        try{
            const cliente = await Cliente.findOne({usuario:req.payload.id});
            if(!cliente) return res.status(400).send({errors:"Cliente não encontrado"})
            const pedido = await Pedido.findOne({cliente:cliente._id, _id:req.params.id});
            if(!pedido) return res.status(400).send({errors:"Pedido não encontrado"});
            pedido.cancelado = true;

            const registroPedido = new RegistroPedido({
                pedido:pedido._id,
                tipo:"pedido",
                situacao:"pedido_cancelado_pelo_cliente"
            })

            await pedido.save();
            await atualizarQuantidade("cancelar_pedido", pedido);
            await registroPedido.save();

            enviarNovoPedido({ pedido, usuario: cliente.usuario });
            const administradores = await Usuario.find({ permissao: "admin", loja })
            administradores.forEach(usuario => {
                enviarNovoPedido({ pedido, usuario })
            });

            res.send({cancelado:true});
        } catch (e) {next(e)}
    }
}

module.exports = PedidoController;