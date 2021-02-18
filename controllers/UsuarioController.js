const mongoose = require('mongoose');
const Usuario = mongoose.model('Usuario');
const enviarEmailRecovery = require('../helpers/email-recovery');

class UsuarioController {
  //GET /
  index(req, res, next) {
    console.log('index');
    Usuario.findById(req.payload.id)
      .then((usuario) => {
        if (!usuario)
          return res.status(401).json({ errors: 'Usuário não registrado' });
        return res.json({ usuario: usuario.enviarAuthJSON() });
    }).catch(next);
  }

  //GET /:id
  show(req, res, next) {
    Usuario.findById(req.params.id)
      .select("-salt -hash")
      .populate({ path: 'Loja' })
      .then((usuario) => {
        if (!usuario)
          return res.status(401).send({ errors: 'Usuario não registrado' });
        return res.send({usuario})
      })
      .catch(next);
  }

  //POST /registrar
  store(req, res, next) {
    const { nome, email, password, loja } = req.body;
    const usuario = new Usuario({ nome, email, loja });
    usuario.setSenha(password);
    usuario.save().then(() => res.send({usuario: usuario.enviarAuthJSON()})).catch(next);
  }

  //PUT /
  update(req, res, next) {
    const { nome, email, password } = req.body;

    Usuario.findById(req.payload.id)
      .then((usuario) => {
        if (!usuario) return res.status(401).json({ errors: 'Usuário não registrado' });

        if (nome) usuario.nome = nome;
        if (email) usuario.email = email;
        if (password) usuario.password = usuario.setSenha(password);

        usuario.save().then(() => {res.json({usuario: usuario.enviarAuthJSON()});}).catch(next);
    }).catch(next);
  }

  //DELETE /
  remove(req, res, next) {
    Usuario.findById(req.payload.id)
      .then((usuario) => {
          usuario.remove().then(() => res.send({ deletado: true }))
          .catch(next);
    }).catch(next);
  }

  //POST /login
  login(req, res, next) {
    const { email, password } = req.body;

    Usuario.findOne({ email })
      .then((usuario) => {
        if (!usuario.validarSenha(password)) res.status(401).json({ errors: 'Senha inválida' });
        res.send({ usuario: usuario.enviarAuthJSON() });
    }).catch(next);
  }

  //GET /recuperar-senha
  showRecovery(req, res, next) {res.render('recovery', { errors: null});}

  //POST /recuperar-senha
  createRecovery(req, res, next) {
    const { email } = req.body;

    Usuario.findOne({ email: email })
      .then((usuario) => {
        console.log(email);
        if (!usuario) res.render('recovery', {errors: 'Não existe usuário com esse email'});
        const recoveryData = usuario.criarTokenRecuperacaoSenha();
        usuario
          .save()
          .then(() => {
            enviarEmailRecovery({ usuario, recovery: recoveryData }, (errors = null) => {
                res.render('recovery', { errors });
              }
            );
          }).catch(next);
      }).catch(next);
  }

  //GET /senha-recuperada
  showCompleteRecovery(req, res, next) {
    if (!req.query.token) res.render('recovery', {errors: 'Token não identificado'});

    Usuario.findOne({ 'recovery.token': req.query.token })
      .then((usuario) => {
        if (!usuario) res.render('recovery', {errors: 'Não existe usuário com este token'});
        if (new Date(usuario.recovery.date) < new Date()) res.render('recovery', {errors: 'Token expirado'});
        res.render('recovery/store', {errors: null, token: req.query.token});
      }).catch(next);
  }

  //POST /senha-recuperada
  completeRecovery(req, res, next) {
    const { token, password } = req.body;

    if (!token || !password) res.render('recovery', {errors: 'Preencha com sua nova senha'});
    Usuario.findOne({ 'recovery.token': token })
      .then((usuario) => {
        if (!usuario) res.render('recovery', {errors: 'Usuario não identificado'});

        usuario.finalizarTokenRecuperacaoSenha();
        usuario.setSenha(password);

        usuario.save().then(() => {
          console.log('render');
          res.render('recovery/store', {errors: null, message: 'Senha alterada com sucesso. Tente fazer o login.', token: null});
        });
      }).catch(next);
  }
}

module.exports = UsuarioController;
