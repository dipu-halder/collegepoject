const validate = (schema) => async (req, res, next) => {
  try {
    // Fixed typo: req.bady → req.body
    const parseBody = await schema.parseAsync(req.body);
    req.body = parseBody;
    next();
  } catch (err) {
    const status =422;
    // Fixed typo: err.error → err.errors (correct key for Zod errors)
    const message = "Validation error";
    const extraDetails =err.errors[0].message  ;
   
    const error = {
      status, 
      message,
      extraDetails,
    }
   
    console.log(error);
    
    // Fixed typo: mag → message
    // res.status(400).json({ message });
    next(error);
  }
};

module.exports = validate;
