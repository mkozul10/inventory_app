import express from 'express';
import { render } from 'ejs';
import morgan from 'morgan';
import { connectToDb, getDb } from './db.js';
import multer from 'multer';
import path from 'path';
let CUR_FILE_NAME;
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//multer conf

const storage = multer.diskStorage({
    destination: (req,file, cb) => {
        cb(null, 'public')
    },
    filename: (req, file, cb) => {
        const name = Date.now() + path.extname(file.originalname);
        CUR_FILE_NAME = name;
        cb(null, name);
    }
})

const upload = multer({storage: storage});


//db and express connection
let db;

connectToDb(err => {
    if (!err) {
        app.listen(3000, () => {
            console.log('Listening on port 3000');
        })

        db = getDb();
    }
})


//register view engine
app.set('view engine', 'ejs');


//middleware and static files
app.use(express.static('public'));
app.use(morgan('dev'));


//routes
app.get('/', async (req, res) => {
    try {
        const parts = await db.collection('products')
            .find()
            .toArray();
        res.render('categories/index',{title: 'Car parts', data: parts});
    } catch (err) {
        res.status(500).render('404', {title: '404'});
    }
})

app.get('/engine', (req, res) => {
    res.render('categories/engine',{title: 'Engine parts'});
})

app.get('/interior', (req, res) => {
    res.render('categories/interior',{title: 'Interior parts'});
})

app.get('/transmission', (req, res) => {
    res.render('categories/transmission',{title: 'Transmission parts'});
})

app.get('/wheels', (req, res) => {
    res.render('categories/wheels',{title: 'Wheels'});
})

app.get('/new', (req, res) => {
    res.render('categories/newPart',{title: 'New part'});
})

app.post('/', upload.single('image') ,async (req, res) => {
    let newItem = req.body;
    newItem.file = CUR_FILE_NAME;
    
    console.log(newItem);
    try{
        const result = await db.collection('products')
            .insertOne(newItem)
        res.status(200).redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).redirect('/404');
    }
})
//404
app.use((req,res) => {
    res.status(404).render('404', {title: '404'});
})
