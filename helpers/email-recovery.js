const transporter = require('nodemailer').createTransport(
  require('../config/email')
);

const { api: link } = require('../config/index')

module.exports = ({ usuario, recovery }, cb) => {
  const message = `
  <h1 style='text-align: center'>Recuperação de Senha</h1>
  <br />
  <p>
  Aqui está o link para redefinir sua senha. Acesse ele e digite novamente sua nova senha: </p>
  <a href="${link}/v1/api/usuarios/senha-recuperada/?token=${recovery.token}">
    localhost:3000/v1/api/usuarios/senha-recuperada/?token=${recovery.token}
  </a>
  ${link}
  <br /><br /><hr />
  <p>
    Obs.: Se você não solicitou a redefinição, apenas ignore esse email.
  </p>
  <br />
  <p>Atenciosamente, Loja TI</p>
  `;

  const opcoesEmail = {
    from: 'naoresponder@lojati.com',
    to: usuario.email,
    subject: 'Redefinição de Senha - Loja TI',
    html: message,
  };

  if (process.env.NODE_ENV === 'production') {
    transporter.sendMail(opcoesEmail, function (error, info) {
      if (error) {
        return cb('Aconteceu um erro no envio do email, tente novamente.');
      } else {
        return cb(
          null,
          'Link para redefinição de senha enviado com sucesso para seu email'
        );
      }
    });
  } else {
    return cb(
      null,
      'Link para redefinição de senha enviado com sucesso para seu email'
    );
  }
};
