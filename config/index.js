module.exports = {
  secret:
    process.env.NODE_ENV === 'production' ? process.env.SECRET : 'desenvolvimento',
  api:
    process.env.NODE_ENV === 'production'
      ? 'https://api.loja-teste.ampliee.com'//VERIFICAR DOMINIO
      : 'https://localhost:3000',
  loja:
    process.env.NODE_ENV === 'production'
      ? 'https://loja-teste.ampliee.com'//VERIFICAR DOMINIO
      : 'https://localhost:8000',
};
