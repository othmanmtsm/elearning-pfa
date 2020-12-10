const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const fs = require('fs');
const path = require('path');
const databaseConfig = require('../config/database');


const pathToken = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToken, 'utf8');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
}

const strategy = new JwtStrategy(options, (payload, done) => {
    
    const query = {
        name: 'fetch-user',
        text: 'SELECT * FROM user WHERE id = $1',
        values: [payload.sub],
      }

    databaseConfig(query).then(data=>{
        if(data.rows[0]){
            return done(null , data.rows[0]);
        }else{
            return done(null, false);
        }
    }).catch(err=>{
            return done(err,false);
    });     
});


module.exports = (passport) => {

    passport.use(strategy);

}