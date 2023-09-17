import express from 'express';
import { render } from 'ejs';
import morgan from 'morgan';
import { connectToDb, getDb } from './db.js';
import multer from 'multer';
import path from 'path';
import { ObjectId } from 'mongodb';
import {unlink} from 'fs';
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


const getItems = async (req,res,category) => {
    try {
        const parts = await db.collection('products')
            .find({category: category})
            .toArray();
        res.render(`categories/${category}`,{title: category, data: parts});
    } catch (err) {
        console.log(err);
        res.status(500).render('404', {title: '404'});
    }
}

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
        console.log(err);
        res.status(500).render('404', {title: '404'});
    }
})

app.get('/engine', (req, res) => {
    getItems(req,res,'engine');
})

app.get('/interior', (req, res) => {
    getItems(req,res,'interior');
})

app.get('/transmission', (req, res) => {
    getItems(req,res,'transmission');
})

app.get('/wheels', (req, res) => {
    getItems(req,res,'wheels');
})

app.get('/new', (req, res) => {
    res.render('categories/newPart',{title: 'New part'});
})

app.post('/', upload.single('image') ,async (req, res) => {
    let newItem = req.body;
    newItem.file = CUR_FILE_NAME;
    
    //console.log(newItem);
    try{
        const result = await db.collection('products')
            .insertOne(newItem)
        res.status(200).redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).redirect('/404');
    }
})

app.get('/:id', async (req,res) => {
    try {
        if (ObjectId.isValid(req.params.id)) {
            const part = await db.collection('products')
                .findOne({_id: new ObjectId(req.params.id)})
            res.status(200).render('categories/partDetails', {title: 'Details', data: part})
        }
        else res.status(500).render('404', {title: '404'});
    } catch (err) {
        console.log(err);
        res.status(500).render('404');
    }
})

app.delete('/:id', async (req,res) => {
    try{
        if(ObjectId.isValid(req.params.id)){
            const part = await db.collection('products')
                .findOne({_id: new ObjectId(req.params.id)})

            const result = await db.collection('products')
                .deleteOne({_id: new ObjectId(req.params.id)})
            res.status(200).json({redirect: '/'});
            console.log(result, 'peder');
            unlink(`public/${part.file}`, (err) => {
                console.log(err);
            })
        }
    } catch (err) {
        console.log(err);
        res.status(500).redirect('/404');
    }
})


//404
app.use((req,res) => {
    res.status(404).render('404', {title: '404'});
})
