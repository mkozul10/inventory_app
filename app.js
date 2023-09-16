import express from 'express';
import { render } from 'ejs';
import morgan from 'morgan';

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//connect to server
app.listen(3000, () => {
    console.log('Listening on port 3000');
})


//register view engine
app.set('view engine', 'ejs');


//middleware and static files
app.use(express.static('public'));
app.use(morgan('dev'));


//routes
app.get('/', (req, res) => {
    res.render('categories/index',{title: 'Car parts'});
})


//404
app.use((req,res) => {
    res.status(404).render('404', {title: '404'});
})
