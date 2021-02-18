const transporter = require('nodemailer').createTransport(require('../config/email'));
const { loja } = require('../config/index');
const moment = require("moment");

const send = ({subject, emails, message}, cb = null) => {
    const mailOptions = {
        from:"no-reply@seraphim.com",
        to:emails,
        subject,
        html:message
    };
    if(process.NODE_ENV === "production"){
        transporter.sendMail(mailOptions, function(error, info) {
            if(error){
                console.warn(error);
                if(cb) return cb(error);
            } else {
                if(cb) return cb(null, true)
            }
        })
    } else {
        console.log(mailOptions);
        if(cb) return cb(null, true);
    }
};

// NOVO PEDIDO
const enviarNovoPedido = ({usuario, pedido}) => {
    produtoNomes = pedido.carrinho.map(item => item.produto.nome);
    const message = `
        <h1>Olá, ${usuario.nome.split(" ").slice(0, 1)}!</h1>
        <p>Os seus pedidos:</p>
        <p><b>${produtoNomes}</b></p>
        <p>enviados hoje, dia ${moment(pedido.createdAt).format("DD/MM/YYYY")}, foram recebidos com sucesso :)</p>
        <br />
        <a href=${loja}>Acesse a loja para saber mais.</a>
        <br /><br />
        <p>Atenciosamente, </p>
        <p>Seraphim StyleStore</p>
    `;
    send({
        subject: "Pedido Recebido - Seraphim StyleStore",
        emails: usuario.email,
        message
    });
} 

// PEDIDO CANCELADO
const cancelarPedido = ({usuario, pedido}) => {
    const message = `
        <h1>Olá, ${usuario.nome.split(" ").slice(0, 1)}!</h1>
        <h2>O seu ${pedido.nome} foi cancelado hoje, dia ${moment(pedido.createdAt).format("DD/MM/YYYY")}</h2>
        <br />
        <a href=${loja}>Acesse a loja para saber mais.</a>
        <br /><br />
        <p>Atenciosamente, </p>
        <p>Seraphim StyleStore</p>
    `;
    send({
        subject: "Pedido Cancelado - Seraphim StyleStore",
        emails: usuario.email,
        message
    });
}

// ATUALIZACAO DE PAGAMENTO E ENTREGA
const atualizarPedido = ({usuario, pedido, situacao, data, tipo}) => {
    const message = `
        <h1>Olá!</h1>
        <h2>ID do Pedido: ${pedido._id}</h2>
        <h2>Nova Atualização: ${situacao} - ${moment(pedido.createdAt).format("DD/MM/YYYY HH:mm")}</h2> 
        <h2>Data: ${moment(data).format("DD/MM/YYYY")}</h2>
        <br />
        <a href=${loja}>Acesse a loja para saber mais.</a>
        <br /><br />
        <p>Atenciosamente, </p>
        <p>Seraphim StyleStore</p>
    `;
    send({
        subject: `${tipo} - Seraphim StyleStore`,
        emails: usuario.email,
        message
    });
}

module.exports = {
    enviarNovoPedido,
    cancelarPedido,
    atualizarPedido
}

