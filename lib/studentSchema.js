const Joi = require("joi");

const studentShcema = Joi.object({
    firstName : Joi.string().required(),
    lastName : Joi.string().required(),
    phoneNumber : Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    profilePicture : Joi.string()
});

module.exports = studentShcema;