const Joi = require("joi");

const loginShcema = Joi.object({
    email : Joi.string().email().min(8).max(254).lowercase().trim().required(),
    password : Joi.string().pattern(new RegExp("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$")).required()
});

module.exports = loginShcema;