const express = require('express');
const router = express.Router();
const validateUser = require('../middlewares/validateUser');
const databaseConfig = require('../config/database');


router.get('/courses', validateUser, (req, res) => {
    let coursesQuery = {
        text : 'select c.*, p.title as group_name, sc."schoolName" from students s join group_student gs on s.id = gs.id_student join groups p on gs.id_group = p.id join courses c on p.id = c.id_group join schools sc on sc.id = p.id_school where s."userId" = $1',
        values : [req.userid]
    };
    databaseConfig(coursesQuery).then(data=>{
        res.status(200).json(data.rows);
    });
});

router.get('/course/:id', (req, res) => {
    let query = {
        text : 'select ch.* from courses c join chapters ch on c.id = ch.id_course where c.id = $1',
        values : [req.params['id']]
    };
    databaseConfig(query).then(data=>{
        res.status(200).json(data.rows);
    });
});

module.exports = router;