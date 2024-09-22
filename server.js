const express = require('express');
const app = express();
const fs = require('fs');
const hostname = 'localhost';
const port = 3001;
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');
const { log } = require('console');
const { exec } = require('child_process');
const sharp = require('sharp');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'img/uploadimg/');
    },

    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "newlinklistDB"
})

con.connect(err => {
    if (err) throw (err);
    else {
        console.log("MySQL connected");
    }
})
const queryDB = (sql) => {
    return new Promise((resolve, reject) => {
        con.query(sql, (err, result, fields) => {
            if (err) reject(err);
            else
                resolve(result)
        })
    })
}
app.get('/clearCookie', async (req, res) => {
    res.clearCookie("user_id");
    res.clearCookie("EditItemId");
    res.end();
})
app.post('/regisDB', async (req, res) => {

    let now_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let sql = `CREATE TABLE IF NOT EXISTS 
    userInfo (
        user_id int unique auto_increment, 
        reg_date TIMESTAMP, 
        username VARCHAR(255), 
        password VARCHAR(100),
        primary key (user_id)
        )`;
    let result = await queryDB(sql);

    var jsonObj = await queryDB("select username from userinfo");
    var keys = Object.keys(jsonObj);
    for (var key of keys) {
        if (req.body.username == jsonObj[key].username) {
            return res.redirect('html/register.html?error=1');
        }
    }
    if (req.body.repassword != req.body.password) {
        console.log("password not match");
        return res.redirect('html/register.html?error=2');
    }
    sql = `insert into userInfo (reg_date,username,password) values ("${now_date}",'${req.body.username}','${req.body.password}')`;
    result = await queryDB(sql);
    return res.redirect('html/main.html');
})
const upload = multer({ storage: storage });
app.post('/uploadimage', upload.single('profile'), (req, res) => {
    res.send(req.file.filename);
});

app.post('/editItem', (req, res) => {
    res.cookie('EditItemId', req.body.id);
    res.send('edititem.html');
})

app.get('/logout', (req, res) => {
    res.clearCookie('user_id');
    return res.redirect('html/index.html');
})
app.post('/getItemById', async (req, res) => {
    var jsonObj = await queryDB(`select * FROM itemDB JOIN tagDB ON itemDB.item_id = tagDB.item_id WHERE itemDB.item_id = '${req.body.id}'`);
    res.send(jsonObj);
})
app.post('/readItem', async (req, res) => {
    await queryDB(`CREATE TABLE IF NOT EXISTS 
    itemDB (
        item_id int unique auto_increment,
        user_id int,
        name VARCHAR(255),
        link VARCHAR(255),
        img VARCHAR(255),
        primary key (item_id))
            `);
    await queryDB(`CREATE TABLE IF NOT EXISTS 
    tagDB (
        tag_id int unique auto_increment, tagFavorite VARCHAR(1),
        item_id int, tag0 VARCHAR(1),tag1 VARCHAR(1),
        tag2 VARCHAR(1),tag3 VARCHAR(1),
        primary key (tag_id))
        `);
    var jsonObj;
    var sortType;
    if (req.body.sortAZ) {
        sortType = "DESC";
    } else {
        sortType = "ASC";
    }
    if (req.body.FavoriteCB == '0') {
        if (req.body.CB0 == 0 && req.body.CB1 == 0 && req.body.CB2 == 0 && req.body.CB3 == 0 && !jsonObj) {
            jsonObj = await queryDB(`select * FROM itemDB JOIN tagDB ON itemDB.item_id = tagDB.item_id 
                WHERE 
                itemDB.user_id = "${req.body.user_id}" AND itemDB.name LIKE "${req.body.searchText}" 
                ORDER BY itemDB.name ${sortType}`)
        } else {
            jsonObj = await queryDB(`select * FROM itemDB JOIN tagDB ON itemDB.item_id = tagDB.item_id 
            WHERE 
            (tagDB.tag0 = '${req.body.CB0}' AND tagDB.tag0 = '1' OR 
            tagDB.tag1 = '${req.body.CB1}'  AND tagDB.tag1 = '1' OR 
            tagDB.tag2 = '${req.body.CB2}'  AND tagDB.tag2 = '1' OR 
            tagDB.tag3 = '${req.body.CB3}'  AND tagDB.tag3 = '1') AND 
            itemDB.user_id = "${req.body.user_id}" AND itemDB.name LIKE "${req.body.searchText}"
            ORDER BY itemDB.name ${sortType}`);
        }
    } else if (req.body.FavoriteCB == '1') {
        if (req.body.CB0 == 0 && req.body.CB1 == 0 && req.body.CB2 == 0 && req.body.CB3 == 0 && !jsonObj) {
            jsonObj = await queryDB(`select * FROM itemDB JOIN tagDB ON itemDB.item_id = tagDB.item_id 
                WHERE 
                itemDB.user_id = "${req.body.user_id}"AND tagDB.tagFavorite = '1' AND itemDB.name LIKE "${req.body.searchText}" 
                ORDER BY itemDB.name ${sortType}`)
        } else {
            jsonObj = await queryDB(`select * FROM itemDB JOIN tagDB ON itemDB.item_id = tagDB.item_id 
            WHERE 
            (tagDB.tag0 = '${req.body.CB0}' AND tagDB.tag0 = '1' OR 
            tagDB.tag1 = '${req.body.CB1}'  AND tagDB.tag1 = '1' OR 
            tagDB.tag2 = '${req.body.CB2}'  AND tagDB.tag2 = '1' OR 
            tagDB.tag3 = '${req.body.CB3}'  AND tagDB.tag3 = '1') AND 
            itemDB.user_id = "${req.body.user_id}" AND tagDB.tagFavorite = '1' AND itemDB.name LIKE "${req.body.searchText}"
            ORDER BY itemDB.name ${sortType}`);
        }
    }
    res.send(jsonObj);
})
app.post('/writeItem', async (req, res) => {
    var itemObj = await queryDB(`insert into itemDB(name,user_id,link,img) values('${req.body.name}','${req.body.user_id}','${req.body.link}','${req.body.img}')`);
    var itemid = await queryDB(`select item_id FROM itemDB WHERE name = "${req.body.name}" AND user_id = '${req.body.user_id}' AND link = "${req.body.link}" AND img = "${req.body.img}"`);
    var tag = await queryDB(`
    insert into tagDB(item_id,tagFavorite,tag0,tag1,tag2,tag3) 
    values(
        '${itemid[0]["item_id"]}','${req.body.FavoriteCB}',
        '${req.body.CB0}','${req.body.CB1}',
        '${req.body.CB2}','${req.body.CB3}')
        `);
    res.send('main.html');
    res.end();
})
app.post('/updateItem', async (req, res) => {
    await queryDB(`UPDATE itemDB SET 
    name = '${req.body.name}', 
    link = '${req.body.link}', 
    img = '${req.body.img}'
    where item_id = '${req.body.item_id}'`);
    await queryDB(`UPDATE tagDB SET 
    tag0 = '${req.body.CB0}', 
    tag1 = '${req.body.CB1}', 
    tag2 = '${req.body.CB2}',
    tag3 = '${req.body.CB3}', 
    tagFavorite = '${req.body.FavoriteCB}'
    where item_id = '${req.body.item_id}'`);
    res.clearCookie("EditItemId");
    res.send('main.html');
    res.end();
})
app.post('/fetchSearch', async (req, res) => {
    var itemObj = await queryDB(`select * FROM itemDB WHERE name LIKE '%' + "${req.body.searchText}" + '%'`);
    res.send(itemObj);
    res.end();
})
app.post('/updateFavorite', async (req, res) => {
    await queryDB(`UPDATE tagDB SET 
    tagFavorite = '${req.body.FavoriteCB}'
    where item_id = '${req.body.item_id}'`);
    res.send('');
    res.end();
})
app.post('/deleteItem', async (req, res) => {
    await queryDB(`DELETE FROM itemDB WHERE item_id = '${req.body.item_id}'`);
    await queryDB(`DELETE FROM tagDB WHERE item_id = '${req.body.item_id}'`);
    res.clearCookie("EditItemId");
    res.send('main.html');
    res.end();
})
async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
        console.log(`File ${filePath} has been deleted.`);
    } catch (err) {
        console.error(err);
    }
}
app.post('/checkLogin', async (req, res) => {
    let sql = `CREATE TABLE IF NOT EXISTS 
    userInfo (
        user_id int unique auto_increment, 
        reg_date TIMESTAMP, 
        username VARCHAR(255), 
        password VARCHAR(100),
        primary key (user_id)
        )`;
    var createTable = await queryDB(sql);
    var jsonObj = await queryDB("select user_id,username,password from userinfo");
    var keys = Object.keys(jsonObj);
    var isMatched = false;
    for (var key of keys) {
        if (req.body.username == jsonObj[key].username && req.body.password == jsonObj[key].password) {
            console.log("matched");
            isMatched = true;
            res.cookie("user_id", jsonObj[key].user_id);
            return res.redirect('html/main.html');
        }
    }
    if (!isMatched) {
        console.log("not matched");

        return res.redirect('html/index.html?error=1');
    }
})

app.get('/gosave', async (req, res) => {
    return res.redirect('html/saveitem.html');
})
app.get('/backmain', async (req, res) => {
    res.clearCookie("EditItemId");
    return res.redirect('html/main.html');
})
app.get('/goNewAc', async (req, res) => {
    return res.redirect('html/register.html');
})
app.get('/backLogin', async (req, res) => {
    return res.redirect('html/index.html');
})
app.get('/exit', (req, res) => {
    process.exit(0);
});

app.listen(port, hostname, () => {
    console.log(`Server running at   http://${hostname}:${port}/html`);
    exec(`start http://${hostname}:${port}/html`);
});