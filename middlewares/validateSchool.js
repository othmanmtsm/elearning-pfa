const utils = require("../lib/utils");
const databaseConfig = require('../config/database');

module.exports = (req, res, next)=>{
    let payload = utils.getPayload(req.header('Authorization').slice(7));
    let query = {
        text : 'select type from users where id=$1',
        values : [payload.sub]
    };
    databaseConfig(query).then(data=>{
        if (data.rows[0].type == 'school') {
            req.userid = payload.sub;
            next();
        }else{
            res.status(400).json({
                message : 'error'
            });
        }
    }).catch(e=>{
        res.status(400).json({
            message : 'error'
        });
    });
}