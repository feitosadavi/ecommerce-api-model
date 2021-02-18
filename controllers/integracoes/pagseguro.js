const pagSeguroConfig = require("../../config/pagseguro");
const PagSeguro = require("../../helpers/pagseguro");

const _criarPagamentoComBoleto = (senderHash, {cliente, carrinho, entrega, pagamento, produto}) => {
    return new Promise((resolve, reject) => {
        const pag = new PagSeguro(pagSeguroConfig);
        pag.setSender({
            name:cliente.nome,
            email:cliente.usuario.email,
            cpf_cnpj:cliente.CPF.replace(/[^\d]+/g,''),
            area_code:cliente.telefones[0].slice(0,2), //código de área do telefone
            phone:cliente.telefones[0].slice(2).trim().split(" ").join("").replace(/[^\d]+/g,''),
            birth_date:cliente.nascimento, //formato DD/MM/YYYY
        });

        pag.setShipping({
            street:entrega.endereco.local,
            number:entrega.endereco.numero,
            district:entrega.endereco.bairro,
            city:entrega.endereco.cidade,
            state:entrega.endereco.estado,
            postal_code:entrega.endereco.CEP.replace(/[^\d]+/g,''),
            cost:entrega.custo,
            same_for_billing:pagamento.enderecoEntregaIgualCobranca //true or false
        });

        pag.setBilling({
            street:entrega.endereco.local,
            number:entrega.endereco.numero,
            district:entrega.endereco.bairro,
            city:entrega.endereco.cidade,
            state:entrega.endereco.estado, 
            postal_code:entrega.endereco.CEP.replace(/-/g,"")
        });

        carrinho.forEach(item => {
            pag.addItem({
                qtde:item.quantidade,
                value:item.precoUnitario,
                description:`${item.nomeProduto} - ${item.variacao.nome}`,
            });
        });

        pag.sendTransaction({
            method:"boleto",
            //value:pagamento.value,
            //O valor será definido pela api
            installments:1,
            hash:senderHash
        }, (err, data) => (err) ? reject(err) : resolve(data));
    });
}

const _criarPagamentoComCartao = (senderHash, {cliente, entrega, pagamento, carrinho}) => {
    return new Promise((resolve, reject) => {
        const pag = new PagSeguro(pagSeguroConfig);
        pag.setSender({
            name:cliente.nome,
            email:cliente.usuario.email,
            cpf_cnpj:cliente.CPF.replace(/[^\d]+/g,''),
            area_code:cliente.telefones[0].slice(0,2), //código de área do telefone
            phone:cliente.telefones[0].slice(2).trim().split(" ").join("").replace(/[^\d]+/g,''),
            birth_date:cliente.nascimento, //formato DD/MM/YYYY
        });

        pag.setShipping({
            street:entrega.endereco.local,
            number:entrega.endereco.numero,
            district:entrega.endereco.bairro,
            city:entrega.endereco.cidade,
            state:entrega.endereco.estado,
            postal_code:entrega.endereco.CEP.replace(/[^\d]+/g,''),
            cost:entrega.custo,
            same_for_billing:pagamento.enderecoEntregaIgualCobranca //true or false
        });

        pag.setBilling({
            street:entrega.endereco.local,
            number:entrega.endereco.numero,
            district:entrega.endereco.bairro,
            city:entrega.endereco.cidade,
            state:entrega.endereco.estado, 
            postal_code:entrega.endereco.CEP.replace(/-/g,"")
        });

        carrinho.forEach(item => {
            pag.addItem({
                qtde:item.quantidade,
                value:item.precoUnitario,
                description:`${item.nomeProduto} - ${item.variacao.nome}`,
            });
        });

        pag.setCreditCardHolder({
            name:pagamento.cartao.nomeCompleto || cliente.nome,
            area_code:pagamento.cartao.codigoArea.trim() || cliente.telefones[0].slice(0,2),
            phone:(pagamento.cartao.telefone.trim() || cliente.telefones[0].slice(2).trim()).split(" ").join("").replace(/[^\d]+/g,''),
            birth_date:pagamento.cartao.nascimento || cliente.nascimento,
            cpf_cnpj: (pagamento.cartao.CPF || cliente.CPF).replace(/[^\d]+/g,'')
        });//Dados do dono do cartão
        console.log(pagamento.parcelas);
        pag.sendTransaction({
            method:"creditCard",
            //O valor será definido pela api
            value: pagamento.valor % 2 !== 0 && pagamento.parcelas !== 1 ? pagamento.valor + 0.01 : pagamento.valor,
            installments:pagamento.parcelas,
            hash:senderHash,
            credit_card_token: pagamento.cartao.credit_card_token
        }, (err, data) => (err) ? reject(err) : resolve(data));
    });
}

const criarPagamento = async (senderHash, data) => {
    try {
        if(data.pagamento.forma === "boleto") return await _criarPagamentoComBoleto(senderHash, data);
        if(data.pagamento.forma === "creditCard") return await _criarPagamentoComCartao(senderHash, data);
        else return {errors: "Forma de pagamento não suportada"};
    } catch (e) {
        console.log(e);
        return {errors:"Ocorreu um erro", errors:e}
    }
}

const getSessionId = () => {
    return new Promise((resolve, reject) => {
        const pag = new PagSeguro(pagSeguroConfig);
        pag.sessionId((err, session_id) => (err) ? reject(err+'deu erro mermao') : resolve(session_id))
    })
}

const getTransactionStatus = (codigo) => {
    return new Promise((resolve, reject) => {
        const pag = new PagSeguro(pagSeguroConfig);
        pag.transactionStatus(codigo, (err, result) => (err) ? reject(err) : resolve(result))
    })
    
}

const getNotification = (codigo) => {
    return new Promise((resolve, reject) => {
        const pag = new PagSeguro(pagSeguroConfig);
        pag.getNotification(codigo, (err, result) => (err) ? reject(err) : resolve(result))
    })
}

module.exports = {
    criarPagamento,
    getSessionId,
    getTransactionStatus,
    getNotification
}