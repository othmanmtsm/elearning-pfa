const Joi = require("joi");

const schoolShcema = Joi.object({
    schoolName : Joi.string().required(),
    schoolLogo : Joi.string()
});

module.exports = schoolShcema;