const mongoose = require('mongoose');

const Cartegoria = mongoose.model('Cartegoria');
const Produtos = mongoose.model('Produto');

const Avaliacao = mongoose.model('Avaliacao');
const Variacao = mongoose.model('Variacao');

const getSort = (sortType) => {
    switch(sortType){
        case "alfabetica_a-z":
            return {titulo:1};
        case "alfabetica_z-a":
            return {titulo:-1}
        case "preco_crescente":
            return {preco:1}
        case "preco_decrescente":
            return {preco:-1}
        default:
            return {};
    }
}

class ProdutosController {

    /**
     * ADMIN
    **/

    // POST /criar
    async store(req, res, next) {
        const {nome, descricao, cartegoria:cartegoriaId, preco, promocao, sku} = req.body;
        const {loja} = req.query;
        console.log(loja);
        try{
            const produto = new Produtos({
                nome, 
                disponibilidade:true, 
                descricao, 
                cartegoria:cartegoriaId, 
                preco, 
                promocao, 
                sku, 
                loja
            });

            const cartegoria = await Cartegoria.findById(cartegoriaId);
            cartegoria.produtos.push(produto._id);

            await produto.save();
            await cartegoria.save();

            return res.send({produto});

        }catch(e){
            next(e);
        }
    }

    // PUT /:id
    async update(req, res, next) {
        const {nome, disponibilidade, descricao, cartegoria, preco, promocao, sku} = req.body;
        const {loja} = req.query;
        const {id:_id} = req.params;

        try{
            const produto = await Produtos.findOne({_id, loja});
            if(!produto) return res.status(400).send({errors:"Produto não encontrado"});

            if(nome) produto.nome = nome;
            if(descricao) produto.descricao = descricao;
            if(disponibilidade !== undefined) produto.disponibilidade = disponibilidade;
            if(preco) produto.preco = preco;
            if(promocao) produto.promocao = promocao;
            if(sku) produto.sku = sku;

            if(cartegoria && cartegoria.toString() !== produto.cartegoria.toString()) {//Se a cartegoria recebeu mudança
                const oldCartegoria = await Cartegoria.findById(produto.cartegoria);//Cartegoria velha é a que está no produto
                const newCartegoria = await Cartegoria.findById(cartegoria);//Cartegoria nova é a que está no body

                if(oldCartegoria && newCartegoria){
                    oldCartegoria.produtos = oldCartegoria.produtos.filter(item => item !== produto._id);
                    /**
                     * Vai pegar apenas os produtos que não foram editados (todos menos este). Isto modifica a collection cartegoria
                     */
                    newCartegoria.produtos.push(produto._id);//Adiciona na nova cartegoria este produto
                    produto.cartegoria = cartegoria;//Adiciona a nova cartegoria ao produto
                    await oldCartegoria.save();
                    await newCartegoria.save();
                } else if(newCartegoria){//Se o produto não possuía cartegoria, e terá a partir de agora
                    newCartegoria.produtos.push(produto._id);
                    produto.cartegoria = cartegoria;
                    await newCartegoria.save();
                }
            }

            await produto.save();
            return res.send({produto});

        }catch(e){
            next(e)
        }
    }

    // PUT /images/:id
    async updateImages(req, res, next){
        const {loja} = req.query;
        try{
            const produto = await Produtos.findById({_id:req.params.id, loja});
            if(!produto) return res.status(400).send({errors:"Produto não encontrado"});

            const novasImagens = req.files.map(item => item.filename);
            produto.fotos = produto.fotos.filter(item => item).concat(novasImagens);

            await produto.save();
            return res.send({produto});
        } catch(e){
            next(e);
        }
    }

    async removeImages(req, res, next){}//Faça com o filter, não esqueça. Em desenvolvimento

    //DELETE :/id remove
    async remove(req, res, next){
        const {loja} = req.query;

        try{
            const produto = Produtos.findOne({_id:req.params.id, loja});
            if(!produto) return res.status(200).send({error:"Produto não encontrado"});
            
            const cartegoria = await Cartegoria.findById(produto.cartegoria);
            if(cartegoria){
                cartegoria.produto = cartegoria.produtos.filter(item => item !== produto._id);

                await cartegoria.save()
            }

            await produto.remove();
            return res.send({deleted:true});
        }catch(e){
            next(e)
        }
    }

    /**
    * CLIENTE
    **/

    // GET /
    async index(req, res, next){
       const offset = Number(req.query.offset) || 0;
       const limit = Number(req.query.limit) || 30;
       try{
           const produtos = await Produtos.paginate(
               {loja:req.query.loja},
               {offset, limit, sort:getSort(req.query.sortType)}
            );
            if(!produto) return res.status(400).send({errors:"Produtos não encontrados"});
            return res.send({produtos});

        }catch(e){
           next(e)
       }
    }

    // GET /disponiveis
    async indexDisponiveis(req, res, next){
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 30;
        console.log(req.query);
        try{
            const produtos = await Produtos.paginate(
                {loja:req.query.loja, disponibilidade:true},
                {offset, limit, sort:getSort(req.query.sortType)}
            );
            if(!produto) return res.status(400).send({errors:"Produto não encontrado"});
            return res.send({produtos});

        }catch(e){
            next(e)
        }
    }

    // GET /search/:seach
    async search(req, res, next){
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 30;
        const search = new RegExp(req.params.search, "i");
        try{
            const produtos = Produtos.paginate(
                {
                    loja:req.query.loja,
                    $or: [
                        {"titulo":{$regex:search}},
                        {"descricao":{$regex:search}},
                        {"sku":{$regex:search}}
                    ]
                },
                {offset, limit, sorte:getSort(req.query.sortType)}
            );
            if(!produto) return res.status(400).send({errors:"Produto não encontrado"});
            return res.send({produtos});
        }catch(e){
            next(e);
        }
    }

    // GET /:id
    async show(req, res, next){
        try{
            const produto = await Produtos
                .findById(req.params.id)
                .populate([
                    "avaliacoes", 
                    "variacoes", 
                    "loja"
                ]);
            if(!produto) return res.status(400).send({errors:"Produto não encontrado"});    
            return res.send({produto});
        }catch(e){
            next(e)
        }
    }

    //AVALIACOES
    //GET /:id/avaliacoes
    async showAvaliacoes(req, res, next){
        try {
            const avaliacoes = await Avaliacao.find({produto:req.params.id});       
            res.send({avaliacoes});
            
        } catch (e) {next(e)}
    }

    //VARIACAOES
    //GET /:id/variacoes
    async showVariacoes(req, res, next){
        const {id} = req.params;
        try {
            const variacoes = await Variacao.findOne({produto:id});       
            res.send({variacoes});
            
        } catch (e) {next(e)}
    }
}

module.exports = ProdutosController;