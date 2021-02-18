const mongoose = require('mongoose');
const Variacao = mongoose.model('Variacao');
const Produto = mongoose.model('Produto');

class VariacaoController {

    /*
     *QUALQUER UM 
     */

    //GET /
    async index(req, res, next) {
        const { loja, produto } = req.query;
        try {
            const variacoes = await Variacao.find({ loja, produto });
            return res.send({ variacoes });
        } catch (e) { next(e) }
    }
    async show(req, res, next) {
        const {loja, produto} = req.query;
        const {id:_id} = req.params;
        try {
            const variacoes = await Variacao.findOne({loja, produto, _id});
            return res.send({variacoes})
        } catch (e) {next(e)}
    }

    /**
     * ADMIN
     */

     //POST /criar
    async store(req, res, next){
        const {codigo, nome, preco, promocao, entrega, quantidade} = req.body;
        const {loja, produto} = req.query;
        console.log(entrega);
        try {
            const variacao = new Variacao({
                codigo, nome, preco, promocao, entrega, quantidade, loja, produto
            })
            const _produto = await Produto.findById(produto);//Pega o produto enviado pela URL
            if(!_produto) return res.send(400).send({errors:"Produto não encontrado"});
            if(!_produto.variacoes) {
                return console.log(Object.assign(_produto, {variacoes:[variacao._id]}))
            } else {
                _produto.variacoes.push(variacao._id);//Adiciona as variações no produto
            }
        
            await _produto.save();
            await variacao.save();
            return res.send({ variacao });
        } catch (e) {next(e)}
    }

    //PUT /editar/:id
    async update(req, res, next){
        const {codigo, disponibilidade, nome, preco, promocao, entrega, quantidade} = req.body;
        const { loja, produto } = req.query;
        const {id:_id} = req.params;
        try {
            const variacao = await Variacao.findOne({ _id, produto, loja});
            if(!variacao) return res.status(400).send({errors:"Variação não encontrada"});
            if(codigo) variacao.codigo = codigo;
            if(disponibilidade !== undefined)  variacao.disponibilidade = disponibilidade;
            if(nome)  variacao.nome = nome;
            if(preco)  variacao.preco = preco;
            if(promocao)  variacao.promocao = promocao;
            if(entrega)  variacao.entrega = entrega;
            if(quantidade)  variacao.quantidade= quantidade;

            await variacao.save();
            return res.send({ variacao })
        } catch (e) {next(e)}

    }

    //PUT /imagens/:id
    async updateImagens(req, res, next){
        const { loja, produto } = req.query;
        const {id:_id} = req.params;
        try {
            const variacao = await Variacao.findOne({ _id, produto, loja});
            if(!variacao) return res.status(400).send({errors:"Variação não encontrada"})

            const novasImagens = req.files.map(file => file.filename);//Vai retornar dos arquivos no array, apenas seus nomes
            variacao.fotos = variacao.fotos.filter(file => file).concat(novasImagens)/** 
                Esse "file => file" filtra os itens, removendo-os, para concatenar as novasImagens. Assim não embaralha tudo
            */ 

            await variacao.save();
            res.send({ variacao })
        } catch (e) {next(e)}
    }

    //DELETE /remover/:id
    async remove(req, res, next){
        const { loja, produto } = req.query;
        const {id:_id} = req.params;
        try {
            const variacao = await Variacao.findOne({ _id, produto, loja});
            if(!variacao) return res.status(400).send({errors:"Variação não encontrada"})

            const _produto = await Produto.findById(variacao.produto);
            _produto.variacoes = _produto.variacoes.filter(item => item.toString() !== variacao._id.toString());
            /**
             * Filtra todos as variações que são diferentes do id passado nos parâmetros
             */

            await _produto.save();
            await variacao.remove();
            res.send({ deletado:true });
        } catch (e) {next(e)}
    }
}

module.exports = VariacaoController;