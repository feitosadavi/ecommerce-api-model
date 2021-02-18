const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const RegistroPedidoSchema = Schema({
    pedido:{type:Schema.Types.ObjectId, ref:"Pedido", required:true},
    tipo:{type:String, required:true},//Se é relacionado ao pagamento, entrega ou pedido
    situacao:{type:String, required:true},
    data:{type:Date, default:Date.now},
    payload:{type:Object}
}, {timestamps:true})

module.exports =  mongoose.model('RegistroPedido', RegistroPedidoSchema)