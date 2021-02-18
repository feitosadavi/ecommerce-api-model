const Variacao = require("../../models/variacao");

mongoose = require("mongoose");

const validarQuantidadeDisponivel = async (_carrinho) => {
    let todosTemQuantidadeDisponivel = true;
    try {
        const carrinho = await Promise.all(_carrinho.map(async item => {
            item.variacao = await Variacao.findById(item.variacao._id || item.variacao);
            return item;
        }));

        carrinho.forEach(item => {
            if( !item.variacao.quantidade || item.variacao.quantidade < item.quantidade ) {
            //se não tiver quantidade no estoque ou a quantidade em estoque for menor a quantidade que o usuário
                todosTemQuantidadeDisponivel = false;         
            }
        });
        return todosTemQuantidadeDisponivel;
    } catch(e) {
        console.warn(e);
        return false;
    }
}

const atualizarQuantidade = async (tipo, pedido) => {
    try {
        const carrinho = await Promise.all(pedido.carrinho.map(async item => {
            item.variacao = await Variacao.findById(item.variacao._id || item.variacao);
            if(tipo === "adicionar_pedido") {
                //Retira do estoque e coloca nos bloqueados
                item.variacao.quantidade -= item.quantidade;
                item.variacao.quantidadeBloqueada += item.quantidade;
            } else if(tipo === "confirmar_pedido") {
                //Retira dos bloqueados e envia pro cliente
                item.variacao.quantidadeBloqueada -= item.quantidade;
            } else if(tipo === "cancelar_pedido"){
                //Retira do bloqueado e coloca no estoque
                item.variacao.quantidadeBloqueada -= item.quantidade;
                item.variacao.quantidade += item.quantidade;
            } else {
                console.warn('Tipo inválido');
            }

            await item.variacao.save();
            return item
        }))
        return true;
    } catch (e) {
        console.warn(e);
        return false;
    }
}

module.exports = {validarQuantidadeDisponivel, atualizarQuantidade};