const Joi = require("joi");

const registerShcema = Joi.object({
    email : Joi.string().email().min(8).max(254).lowercase().trim().required(),
    firstName : Joi.string().min(3).max(128).trim().required(),
    lastName : Joi.string().max(128).required(),
    password : Joi.string().pattern(new RegExp("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$")).required(),
    confirmPassword : Joi.valid(Joi.ref('password')).required() ,
});

module.exports = registerShcema;