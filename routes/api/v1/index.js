const router = require('express').Router();

router.use('/lojas', require('./lojas'));

router.use('/usuarios', require('./usuarios'));
router.use('/clientes', require('./clientes'));

router.use('/cartegorias', require('./cartegorias'));
router.use('/produtos', require('./produtos'));
router.use('/avaliacoes', require('./avaliacoes'));
router.use('/variacoes', require('./variacao'));

router.use('/pedidos', require('./pedidos'));
router.use('/entregas', require('./entregas'));
router.use('/pagamentos', require('./pagamentos'));


module.exports = router;
