module.exports = {
    mode: process.env.NODE_ENV === "production" ? "live" : "sandbox",
    sandbox: process.env.NODE_ENV === "production" ? false : true,
    sandbox_email: process.env.NODE_ENV === "production" ? null : "c69705440491266887247@sandbox.pagseguro.com.br",
    email:"davifeitosa.dev@protonmail.com",
    token:"8016399F46FF4BA09B7A5CE89503F314",
    notificationURL:"https://api.loja-teste.ampliee.com/v1/api/pagamentos/notificacao"//VERIFICAR DOMINIO
}