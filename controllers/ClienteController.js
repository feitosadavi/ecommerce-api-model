const mongoose = require("mongoose");
const Cliente = mongoose.model("Cliente");
const Usuario = mongoose.model("Usuario");
const Pedido = mongoose.model("Pedido");

class ClienteController {
  /**
   * ADMIN
   */

  // GET /index
  index(req, res, next) {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 30;
    Cliente.paginate(
      { loja: req.query.loja },
      { offset, limit, populate: 'usuario' }
    )
      .then((clientes) => {
        return res.send({ clientes });
      })
      .catch(next);
  }

  //GET /search/:search/pedidos
  async searchPedidos(req, res, next) {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 30;
    const search = new RegExp(req.params.search, 'i');
    try {
      const clientes = await Cliente.find({loja}, {nome:{$regex:search}});
      const pedidos = await Pedido.paginate(
        {loja, cliente:{$in:clientes.map(item => item._id)}},//Retorna o id dos clientes. Assim, pesquisa clientes com todos os ids achados
        {offset, limit, populate:["cliente", "pagamento", "entrega"]}
      )
      if(!pedidos) return res.status(404).send({errors:`A busca por ${search} não deu resultados`});

      pedidos.docs = await Promise.all(pedidos.docs.map(async (pedido) => {
        pedido.carrinho = await Promise.all(pedidos.carrinho.map(async (item) => {
          item.produto = await Produot.findById(item.produto);
          item.variacao = await variacao.findById(item.varicao);
          return item;
        }));
      }));

      res.send(pedidos);

    } catch (e) {next(e)}
  }

  //GET /search/:search
  search(req, res, next) {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 30;
    const search = new RegExp(req.params.search, 'i');
    Cliente.paginate(
      { loja: req.query.loja, nome: { $regex: search } },
      { offset, limit, populate: 'usuario' }
    ).then((clientes) => {
        if(clientes.total === 0) return res.send({errors:"Clientes não encontrados"})
        return res.send({ clientes });
      }).catch(next);
  }

  // GET /admin/:id
  showAdmin(req, res, next) {
    Cliente.findOne({ _id: req.params.id, loja: req.query.loja })//Procura apenas clientes da loja
      .populate('usuario')
      .then((cliente) => {
        res.send({ cliente });
      })
      .catch(next);
  }

  //PUT /admin/:id
  updateAdmin(req, res, next) {
    const { nome, email, telefones, endereco, nascimento } = req.body;
    Cliente.findById(req.params.id)
      .populate('usuario')
      .select["-salt -hash"]
      .then((cliente) => {
        if (!cliente) return res.status(402).send({ error: 'Cliente não encontrado' });
        if (nome) {
          cliente.nome = nome;
          if(cliente.usuario) {
            cliente.usuario.nome = nome;
            cliente.usuario.email = email;
          }
        }
        if (telefones) cliente.telefones = telefones;
        if (endereco) cliente.endereco = endereco;
        if (nascimento) cliente.nascimento = nascimento;

        cliente
          .save()
          .then((cliente) => res.send({ cliente }))
          .catch(next);
      })
      .catch(next);
  }

  //GET /admin/:id/pedidos
  async showPedidosClientes(req, res, next) {
    try {
      const pedidos = await Pedido.paginate(
        {loja, cliente:req.params.id}, 
        { 
          offset: Number(req.query.offset) || 0, 
          limit: Number(req.query.limit) || 30,
          populate:["cliente", "pagamento", "entrega"]
        },
      );
      
      pedidos.docs = await Promise.all(pedidos.docs.map(async pedido => {
        pedido.carrinho = await Promise.all(pedido.carrinho.map(async item => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        }))
        return produto;
      }))

      res.send({pedidos});
    } catch (e) {next(e)}
  }

  /**
   * CLIENTES
   */
  //GET /:id
  show(req, res, next) {//Mostra os dados do usuário que está logado, ou seja, você
    Cliente.findOne({ usuario: req.payload.id, loja: req.query.loja })
      .populate({path:'usuario', select:"-salt -hash"})
      .then((cliente) => {
        if (!cliente)
          return res
            .status(401)
            .send({ error: 'Clientes não encontrados', success: false });

        return res.send({ cliente });
      })
      .catch(e => next(e));
  }

  //POST /
  async store(req, res, next) {
    const { loja } = req.query;
    try {
      if(req.payload){
        const { nascimento, CPF, telefones, endereco} = req.body;
        const {nome, id, email} = req.payload;

        const _cliente = await Cliente.findOne({usuario:id});
        if(_cliente) return res.status(401).send({errors:"Cliente já cadastrado com esta conta"})

        const cliente = new Cliente({nome, nascimento, CPF, telefones, endereco, loja, usuario:id});
        await cliente.save();

        return res.send({
          cliente: Object.assign({}, cliente._doc, { email }),
        });
        
      } else {
        const { nome, nascimento, CPF, telefones, endereco, email, password} = req.body;

        const usuario = new Usuario({ nome, email, loja });
        usuario.setSenha(password);

        const cliente = new Cliente({
          nome,
          nascimento,
          CPF,
          telefones,
          endereco,
          loja,
          usuario: usuario._id,
        });

        await usuario.save();
        await cliente.save();

        return res.send({
          cliente: Object.assign({}, cliente._doc, { email: usuario.email }),
        });
      }
    } catch (err) {next(err);}
  }

  //UPDATE /
  update(req, res, next) {
    Cliente.findById(req.payload.id)//Quando é payload, é pra pegar as informações do usuário que está logado
      .populate('usuario')
      .then((cliente) => {
        if (!cliente)
          return res
            .status(401)
            .send({ error: 'Cliente não encontrado', success: false });

        const {
          nome,
          nascimento,
          telefones,
          endereco,
          email,
          password,
          CPF,
        } = req.body;

        if (nome) {
          cliente.nome = nome;
          cliente.usuario.nome = nome;
        }
        if (email) cliente.usuario.email = email;
        if (password) cliente.usuario.setSenha(password);
        if (CPF) cliente.CPF = CPF;
        if (nascimento) cliente.endereco = nascimento;
        if (telefones) cliente.telefones = telefones;
        if (endereco) cliente.endereco = endereco;

        cliente
          .save()
          .then((cliente) => res.send({ cliente }))
          .catch(next);
      }).catch(next);
  }

  //REMOVE /:id
  remove(req, res, next) {

    Cliente.findOne({ usuario: req.payload.id })
      .populate('usuario')
      .then((cliente) => {
        cliente.usuario.remove();
        cliente.deletado = true;
        cliente.save();
        return res.send({ deletado: true });
      })
      .catch(next);
  }
}

module.exports = ClienteController;
