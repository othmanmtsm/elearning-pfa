const express = require('express');
const router = express.Router();
const validateSchool = require('../middlewares/validateSchool');
const databaseConfig = require('../config/database');
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
        fileSize: 1024 * 1024 * 10 //10mb max
    }
});



router.get('/groups', validateSchool, (req, res) => {
    let q = {
        text : 'select g.* from groups g join schools s on g.id_school = s.id where s."userId" = $1',
        values : [req.userid]
    };
    databaseConfig(q).then(data=>{
        res.status(200).json(data.rows);
    }).catch(e=>{
        console.log(e.message);
    });
});

router.get('/group/:id/courses', validateSchool, (req, res) => {
    let q = {
        text : 'select * from courses where id_group = $1',
        values : [req.params['id']]
    };
    databaseConfig(q).then(data=>{
        res.status(200).json(data.rows);
    }).catch(e=>{
        console.log(e.message);
    });
});

router.get('/group/:id/students', (req, res) => {
    let q = {
        text : 'select s.id, s."firstName", s."lastName" from students s join group_student gs on s.id = gs.id_student join groups g on g.id = gs.id_group where g.id = $1',
        values : [req.params['id']]
    };
    databaseConfig(q).then(data=>{
        res.status(200).json(data.rows);
    }).catch(e=>{
        console.log(e.message);
    });
});

router.post('/group/:id/courses/add', validateSchool, (req, res) => {
    let q = {
        text: 'insert into courses(title, description, id_group) values($1, $2, $3)',
        values: [req.body.title, req.body.description, req.params['id']]
    };
    databaseConfig(q).then(data=>{
        res.status(200).json({
            success : true,
            message : 'course added successfully',
        });
    }).catch(e=>{
        console.log(e.message);
    });
});

router.post('/groups/add', validateSchool, (req, res) => {
    let q = {
        text : 'insert into groups(title, id_school) values($1, $2)',
        values : [req.body.title, req.body.idSchool]
    }
    databaseConfig(q).then(data=>{
        res.status(200).json({
            success : true,
            message : 'group added successfully',
        });
    }).catch(e=>{
        console.log(e.message);
    });
});

router.post('/courses/:id/chapters/add', upload.single('body'), (req, res) => {
    let body = req.file.path;
    const ch = req.body;
    let q = {
        text : 'insert into chapters(id_course, title, description, type, body) values($1, $2, $3, $4, $5)',
        values : [req.params['id'], ch.title, ch.description, ch.type, body]
    }
    databaseConfig(q).then(data=>{
        res.status(200).json({
            success : true,
            message : 'chapter added successfully',
        });
    }).catch(e=>{
        console.log(e.message);
    });
});

router.post('/group/:id/students/add', (req, res) => {
    console.dir(req.body);
    let q = {
        text: 'insert into group_student(id_group, id_student) values($1, $2)',
        values: [req.params['id'], req.body.student_id]
    };
    databaseConfig(q).then(data=>{
        res.status(200).json({
            success : true,
            message : 'student added successfully',
        });
    }).catch(e=>{
        console.log(e.message);
    });
});

module.exports = router;