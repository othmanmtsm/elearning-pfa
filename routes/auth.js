const express = require('express');
const registerShcema = require('../lib/registerSchema');
const loginShcema = require('../lib/loginShcema');
const utils = require("../lib/utils");
const validationMiddleware = require('../middlewares/validationMiddleware');
const databaseConfig = require('../config/database');
const router = express.Router();



router.post('/login', validationMiddleware(loginShcema) ,(req, res, next) => {

    const query = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [req.body.email],
    };

    databaseConfig(query).then(data=>{
        let user =data.rows[0]
        if(user){
            let validPassword = utils.validPassword(req.body.password,user.hash,user.salt);
            if(validPassword){
            let jwtResult = utils.issueJWT(user);
            return res.status(200).json({
                success: true,
                email : user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                token: jwtResult.token,
                expiresIn: jwtResult.expires
            });
            }else{
                return res.status(400).json({
                    message : 'wrong password'
                });
            }
        }
    }).catch(err=>{
        return res.status(400).json({
            message : 'email or password wrong'
        });
    });


});

router.post('/register', validationMiddleware(registerShcema),(req, res, next) => {

    const existingUserQuery = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [req.body.email],
    }
    databaseConfig(existingUserQuery).then(data=>{
        let user =data.rows[0];
        //check user existance
        if(user){
            return res.status(409).json({
                message : 'Email already exists'
            });
        }else{
            //add user
            const newUser = req.body;
            let genPassword = utils.genPassword(newUser.password);
            const addUserQuery = {
                text: `INSERT INTO users("email","firstName","lastName","hash","salt") VALUES($1, $2, $3, $4, $5)`,
                values: [newUser.email, newUser.firstName, newUser.lastName, genPassword.hash, genPassword.salt],
            }
            databaseConfig(addUserQuery).then(data=>{
                if(data.rowCount>0){
                    return res.status(201).json({
                        success : true,
                        message : 'registertion completed successfully'
                    });
                }else{
                    return res.status(400).json({
                        error : true,
                        message : 'User Registration failed'
                    });
                }
            }).catch(err=>{
                console.log(err);
                return res.status(400).json({
                    error : true,
                    message : 'Something went wrong message1'
                });
            });

        }

     }).catch(err=>{
        return res.status(400).json({
            message : 'Something went wrong message2'
        });
     });
});

module.exports = router;