module.exports = schema => (req, res, next) => {
  let { error } = schema.validate(req, {
    abortEarly: false,
    allowUnknown:true
  })
  if(error) return res.status(422).send({errors:error.details})
  else next(); 
}
