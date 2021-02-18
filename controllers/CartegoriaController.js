const mongoose = require('mongoose');
const { findById } = require('../models/produtos');
const Cartegoria = mongoose.model('Cartegoria');
const Produtos = require('../models/produtos');

class CartegoriaController {

    //GET /
    index(req, res, next) {
        Cartegoria.find({loja:req.query.loja})
            .select("_id produtos nome codigo loja")
            .then(cartegorias => res.send({cartegorias}))
            .catch(next);
    }
    //GET /disponivel
    indexDisponiveis(req, res, next) {
        Cartegoria.find({disponibilidade:true})
            .select("_id produtos nome codigo loja")
            .then(cartegorias => res.send({cartegorias}))
            .catch(next);
    }
    //GET /:id
    show(req, res, next){
        Cartegoria.findOne({loja:req.query.loja, _id:req.params.id})
            .select("_id produtos nome codigo loja")
            //.populate(["produtos"])
            .then(cartegoria => res.send({cartegoria}))  
            .catch(next);
    }
    // GET /:id/produtos
    async showProdutos(req, res, next){
        const {offset, limit} = req.query;
        try{
            const produtos = await Produtos.paginate(
                {cartegoria:req.params.id},
                {offset:Number(offset) || 0, limit:Number(limit) || 30}
            );
            return res.send({produtos})         
        }catch(e){next(e)}
    }

    /**
    *
    *ADMIN
    *
    **/

    //POST /
    store(req, res, next){
        const {nome, codigo} = req.body;
        const {loja} = req.query;
        const cartegoria = new Cartegoria({nome, codigo, loja,disponibilidade:true});
        cartegoria.save().then(() => {res.send(cartegoria)})
        .catch(next);
    }
    //PUT /:id 
    async update(req, res, next){
        try{
            const cartegoria = await Cartegoria.findOne({_id:req.params.id});

            const {nome, codigo, disponibilidade, produtos} = req.body;
            if(nome) cartegoria.nome = nome;
            if(disponibilidade != undefined) cartegoria.disponibilidade = disponibilidade;
            if(codigo) cartegoria.codigo = codigo;
            if(produtos) cartegoria.produtos = produtos;

            console.log(cartegoria.disponibilidade);
            await cartegoria.save() 
            return res.send(cartegoria);
        }catch(e){
            next(e);
        }
    }
    //DELETE /:id
    delete(req, res, next){
        Cartegoria.findById(req.params.id)
        .then(cartegoria => {
            if(!cartegoria) res.status(422).send({error:'Cartegoria inexiste'});

            cartegoria.remove();
            return res.send({deletado:true});
        }).catch(next);
    }
    //PUT /:id/produtos
    async updateProdutos(req, res, next){
        try{
            const cartegoria = await  Cartegoria.findById(req.params.id);
            const {produtos} = req.body;

            if(produtos) cartegoria.produtos = produtos;
            await cartegoria.save();

            let _produtos = await Produtos.find({
                $or: [
                    {cartegory:req.params.id},
                    {_id:{$in:produtos}}
                ]
            });

            _produto = await Promise.all(_produtos.map(async (produto) => {
                if(!produtos.includes(produto._id.toString())){
                    produto.cartegoria = null;
                } else {
                    produto.cartegoria = req.params.id;
                }
                await produto.save();
                return produto;
            }));
            
            const resultado = await Produtos.paginate({cartegoria:req.params.id}, {offset:0, limit:30})
            return res.send({produtos:resultado})
        }catch(e){next(e)}
    }
}

module.exports = CartegoriaController;