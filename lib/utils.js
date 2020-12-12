const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer");

const pathToKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');



function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return {
        salt: salt,
        hash: genHash
    };
}


function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

function issueJWT(user) {
    const id = user.id;
    let dte = Date.now();
    const expiresIn = 604800000;
    const payload = {
        sub: id,
        iat: dte,   
    };

    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
        expiresIn: expiresIn,
        algorithm: 'RS256'
    });

    return {
        token: "Bearer " + signedToken,
        expires: expiresIn
    }
}

async function sendVerifEmail(user){
    const payload = {
        id: user.id
    };
    const token = jsonwebtoken.sign(payload, PRIV_KEY, {
        expiresIn: '1d',
        algorithm: 'RS256'
    });

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: 'elearningpfa1@gmail.com', // generated ethereal user
          pass: 'Letmiin11', // generated ethereal password
        },
      });

      let info = await transporter.sendMail({
        from: 'elearningpfa1@gmail.com', // sender address
        to: user.email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `<a href = 'http://localhost:3000/auth/confirmation/${token}'>click here to confirm email</a>`, // html body
      });
      console.log("Message sent: %s", info.messageId);
}

function getPayload(token){
    return jsonwebtoken.verify(token, PRIV_KEY, {algorithms: ['RS256']});
}


module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.getPayload = getPayload;
module.exports.sendVerifEmail = sendVerifEmail;