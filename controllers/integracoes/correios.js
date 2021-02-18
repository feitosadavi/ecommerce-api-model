const Correios = require('node-correios'),
    correios = new Correios(),
    config = require('../../config/correios'),
    { calcBox } = require('../../helpers/calcBox');

const calcularFrete = async ({ cep, produtos }) => {
        const _produtos = produtos.map(item => ({
            pesoKg:item.variacao.entrega.pesoKg,
            alturaCm:item.variacao.entrega.dimensoes.alturaCm,
            larguraCm:item.variacao.entrega.dimensoes.larguraCm,
            quantidade:item.quantidade,
            preco:item.precoUnitario
        }));
        const caixa = calcBox(_produtos);
        if(caixa.message) return caixa.message;
        const pesoTotal = _produtos.reduce((all, item) => all + ( item.pesoKg * item.quantidade ), 0);

        //Multiplica o peso * quantidade, somando depois com os outros pesos já calculados
        const valorFinal = _produtos.reduce((all, item) => all + (item.preco * item.quantidade ), 0);

    try {
        //Desta forma eu posso ter vários serviços, mesmo sem contrato com os correios
        console.log('aquiiiii');
        const resultados = await Promise.all(
            config.nCdServico.split(',').map(async (servico) => {
                const resultado = await correios.calcPrecoPrazo({
                    nCdServico:servico,// Sedex Varejo e PAC Varejo
                    sCepOrigem:config.sCepOrigem,
                    sCepDestino:cep,
                    nVlPeso:pesoTotal, 
                    nCdFormato:1,//1 = caixa, 2 = rolo/prisma, 3 = envelope
                    nVlComprimento:caixa.comprimento,
                    nVlAltura:caixa.altura,
                    nVlLargura:caixa.largura,
                    nVlDiametro:0,
                    nVlValorDeclarado:valorFinal < 19.50 ? 19.50 : valorFinal //O mínimo do valor declarado para os correios é 19.50  
                });
                return {...resultado[0]};
            })
        );
        return resultados;
    } catch (e) {console.log(e)}
}

module.exports = { calcularFrete };
