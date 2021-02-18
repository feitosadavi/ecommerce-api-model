const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const ProdutoSchema = Schema({
    nome:{type:String, required:true},
    disponibilidade:{type:Boolean, required:false},
    descricao:{type:String, required:true},
    fotos:{type:Array, default: []},
    preco:{type:Number, required:true},
    promocao:{type:Number},
    sku:{type:String, required:true, unique:true},
    loja:{type:Schema.Types.ObjectId, ref:'Loja'},
    cartegoria:{type:Schema.Types.ObjectId, ref:'Cartegoria'},
    avaliacoes:{type:[{ type:Schema.Types.ObjectId }], ref:'Avaliacao'},
    variacoes:{type:[{type:Schema.Types.ObjectId}], ref:'Variacao'},
}, {timestamps:true});

ProdutoSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Produto", ProdutoSchema);