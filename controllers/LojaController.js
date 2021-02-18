const mongoose = require('mongoose');
const Loja = mongoose.model('Loja');

class LojaController {
  //GET /
  index(req, res, next) {
    Loja.find({ })
      .select('_id nome cnpj email telefones endereco')
      .then((lojas) => {
        if (!lojas) res.sendStatus(401).send({ errors: 'não possui lojas' });
        res.send({ lojas });
      }).catch(next);
  }

  //GET /:id
  show(req, res, next) {
    Loja.findById(req.params.id)
      .select('_id nome cnpj email telefones endereco')
      .then((loja) => {
        if (!loja) res.status(401).send({ errors: 'não existem lojas com este id'});
        res.send({ loja: loja });
      }).catch(next);
  }

  //POST /
  store(req, res, next) {
    try {
      const { nome, cnpj, email, telefones, endereco } = req.body;
      const loja = new Loja({ nome, cnpj, email, telefones, endereco });

      loja.save().then((loja) => {res.send({ loja});}).catch(next);
    } catch (err) {
      res.status(422).send({ errors: 'O CNPJ já está sendo utilizado' });
    }
  }

  //PUT /:id
  update(req, res, next) {
    const { nome, cnpj, email, telefones, endereco } = req.body;

    Loja.findById(req.query.loja)
      .then((loja) => {
        if (!loja) res.status(422).send({ errors: 'Loja não registrada' });

        if (nome) loja.nome = nome;
        if (cnpj) loja.cnpj = cnpj;
        if (email) loja.email = email;
        if (telefones) loja.telefones = telefones;
        if (endereco) loja.endereco = endereco;

        loja.save().then((loja) => {res.send({ loja });}).catch(next);
      }).catch(next);
  }

  //DELETE /:id
  remove(req, res, next) {
    Loja.findById(req.query.loja).then((loja) => {
      if (!loja) return res.status(422).send({ error: 'Loja não registrada' });
      loja.remove().then(() => res.send({ deleted: true })).catch(next);
    });
  }
}

module.exports = LojaController;
