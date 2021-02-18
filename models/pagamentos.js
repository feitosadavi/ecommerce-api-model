const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

const PagamentoSchema = Schema({
    valor:{type:Number, required:true},
    forma:{type:String, required:true},
    parcelas:{type:Number, default:1},
    situacao:{type:String, required:true},
    endereco: {
        type: {
          local: { types: String, required: true },
          numero: { type: String, required: true },
          complemento: { type: String },
          bairro: { type: String, required: true },
          cidade: { type: String, required: true },
          estado: { type: String, required: true },
          CEP: { type: String, required: true },
        },
        required: true,
    },
    cartao: {
        type: {
          nomeCompleto: { types: String, required: true },
          codigoArea: { type: String, required: true },
          telefone: { type: String },
          nascimento: { type: String, required: true },
          credit_card_token: { type: String, required: true },
          CPF: { type: String, required: true },
        },
        required: false,
    },
    enderecoEntregaIgualCobranca:{type:Boolean, default:true},
    pedido:{type:Schema.Types.ObjectId, ref:"Pedido", required:true},
    loja:{type:Schema.Types.ObjectId, ref:"Loja", required:true},
    payload:{type:Array},
    pagSeguroCode:{type:String}
}, {timestamps:true});

mongoose.plugin(mongoosePaginate);

module.exports = mongoose.model("Pagamento", PagamentoSchema);
