const {z} = require("zod");

const loginSchema = z.object({
    email: z
    .string({required_error:"email is required"}).trim()
    .email({ message: "email address invalid"})
    .min(3,{message: "email must at lest of 3 chars"})
    .max(100,{message: "email must not be more then 100 characters"}),
  
    password: z
    .string({required_error:"password is required"}).trim()
    .min(6,{message: "password must at lest of 6 chars"})
    .max(100,{message: "oassword must not be more then 100 characters"}),
})

// creating object schema
const signupSchema = loginSchema.extend ({
    username: z
    .string({required_error:"name is required"}).trim()
    .min(3,{message: "name must at lest of 3 chars"})
    .max(100,{message: "name must not be more then 100 characters"}),
  
    phone: z
    .string({required_error:"phone number is required"}).trim()
    .min(10,{message: "phone number must at lest of 10 chars"})
    .max(20,{message: "phone number must not be more then 10 characters"}),
  
})




module.exports = {signupSchema, loginSchema};