const express = require('express');
const registerShcema = require('../lib/registerSchema');
const loginShcema = require('../lib/loginShcema');
const utils = require("../lib/utils");
const validationMiddleware = require('../middlewares/validationMiddleware');
const databaseConfig = require('../config/database');
const router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 //5mb max
    }
});



router.post('/login', validationMiddleware(loginShcema),(req, res, next) => {

    const query = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [req.body.email],
    };

    databaseConfig(query).then(data=>{
        let user = data.rows[0];
        if(user){
            if (user.isConfirmed == null) {
                return res.status(400).json({
                    message : 'Please verify your email'
                });
            }else{
                let validPassword = utils.validPassword(req.body.password,user.hash,user.salt);
                if(validPassword){
                let jwtResult = utils.issueJWT(user);
                if (data.rows[0].type == 'student') {
                    let q = {
                        text : 'select * from students where "userId" = $1',
                        values : [user.id]
                    };
                    databaseConfig(q).then(data1 => {
                        console.dir(data1);
                        return res.status(200).json({
                            success: true,
                            email : user.email,
                            type: user.type,
                            firstName: data1.rows[0].firstName,
                            lastName: data1.rows[0].lastName,
                            profilePicture: data1.rows[0].profilePicture,
                            token: jwtResult.token,
                            expiresIn: jwtResult.expires
                        });
                    });
                }else if(data.rows[0].type == 'school'){
                    let q = {
                        text : 'select * from schools where "userId" = $1',
                        values : [user.id]
                    };
                    databaseConfig(q).then(data2 => {
                        return res.status(200).json({
                            success: true,
                            email : user.email,
                            type: user.type,
                            schoolName : data2.rows[0].schoolName,
                            schoolLogo : data2.rows[0].schoolLogo,
                            token: jwtResult.token,
                            expiresIn: jwtResult.expires
                        });
                    });
                }
                }else{
                    return res.status(400).json({
                        message : 'email or password wrong 1'
                    });
                }
            }
        }else{
            return res.status(400).json({
                message : 'email or password wrong 2'
            });
        }
    }).catch(err=>{
        return res.status(400).json({
            message : err.message
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
                error : true,
                message : 'Email already exists'
            });
        }else{
            //add user
            const newUser = req.body;
            let genPassword = utils.genPassword(newUser.password);
            const addUserQuery = {
                text: `INSERT INTO users("email","hash","salt","type") VALUES($1, $2, $3, $4) RETURNING id`,
                values: [newUser.email, genPassword.hash, genPassword.salt, newUser.type],
            }
            databaseConfig(addUserQuery).then(data=>{
                if(data.rowCount>0){
                    return res.status(200).json({
                        success : true,
                        message : 'registertion completed successfully',
                        type: newUser.type,
                        id: data.rows[0].id
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

router.post('/register/student/:id', upload.single('profilePicture'), (req, res)=>{
    let pic = req.file.path;
    const std = req.body;
    const addStudentQuery = {
        text : 'insert into students("firstName", "lastName", "phoneNumber", "profilePicture", "userId") values($1, $2, $3, $4, $5)',
        values : [std.firstName, std.lastName, std.phoneNumber, pic, req.params['id']]
    };
    databaseConfig(addStudentQuery).then(data=>{
        if(data.rowCount>0){
            const getMailQuery = {
                text : 'select email from users where id = $1',
                values : [req.params['id']]
            };
            databaseConfig(getMailQuery).then(data => {
                let user = {
                    id: req.params['id'],
                    email: data.rows[0].email
                }
                utils.sendVerifEmail(user);
            });
            const competeRegQuery = {
                text : 'update users set "regCompleted" = true where id = $1',
                values : [req.params['id']]
            };
            databaseConfig(competeRegQuery).then(()=>{
                return res.status(201).json({
                    success : true,
                    message : 'Registration completed successfully',
                });
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
});

router.post('/register/school/:id', upload.single('schoolLogo'), (req, res)=>{
    let logo = req.file.path;
    const schl = req.body;
    const addSchoolQuery = {
        text : 'insert into schools("schoolName", "schoolLogo", "userId") values($1, $2, $3)',
        values : [schl.schoolName, logo, req.params['id']]
    };
    databaseConfig(addSchoolQuery).then(data=>{
        if(data.rowCount>0){
            const getMailQuery = {
                text : 'select email from users where id = $1',
                values : [req.params['id']]
            };
            databaseConfig(getMailQuery).then(data => {
                let user = {
                    id: req.params['id'],
                    email: data.rows[0].email
                }
                utils.sendVerifEmail(user);
            });
            const competeRegQuery = {
                text : 'update users set "regCompleted" = true where id = $1',
                values : [req.params['id']]
            };
            databaseConfig(competeRegQuery).then(()=>{
                return res.status(201).json({
                    success : true,
                    message : 'registertion completed successfully',
                });
            })
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
});

router.get('/confirmation/:token', (req, res)=>{
    let payload = utils.getPayload(req.params['token']);
    const confirmMailQuery = {
        text : 'update users set "isConfirmed" = NOW() where id = $1',
        values : [payload.id]
    }
    databaseConfig(confirmMailQuery).then(data=>{
        res.status(200).json({
            message : 'Email confirmed'//ss
        });
    });
});

module.exports = router;