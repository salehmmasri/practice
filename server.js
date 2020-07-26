'use strict';

require('dotenv').config();

const express = require('express');

const app = express();

const pg = require('pg');

const superagent = require('superagent');

const client = new pg.Client(process.env.DATABASE_URL);

const methodOverride = require('method-override');
const PORT = process.env.PORT;
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// app.use(express.static('./public'));
// app.use(express.static('./public/js'));



app.get('/search', lodsearche);
app.post('/search', getSearchInfo);
app.post('/addtoDB',addtodatabase);
app.get('/',home);
app.get('/details/:id',vewidetails);
app.put('/update/:id',updatebook);
app.delete('/delete/:id',deletebook);


function lodsearche(req, res) {

    res.render('pages/searches/show');
}


function getSearchInfo(req, res) {
    let text = req.body.booktype;
    let valueOfSelect = req.body.formOne;



    if (valueOfSelect == "title") {
        let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${text}`;
        superagent.get(url)
            .then(data => {
                //  res.render(data);
                // console.log(data.body);
                let arrOfBook = data.body.items.map(book => {
                    let bookobj = new Books(book);
                    return bookobj;
                });
                res.render('pages/searches/new',{booksData:arrOfBook});
            });
    }

}



function Books(book) {
    this.img_url = book.volumeInfo.imageLinks.thumbnail;
    this.title = book.volumeInfo.title;
    this.auther = book.volumeInfo.authors;
    this.description = book.volumeInfo.description;
}


function addtodatabase(req,res){
    let {img_url,title,auther,description} = req.body;
    let SQL=`INSERT INTO bookspr(img_url,title,auther,description) VALUES ($1,$2,$3,$4);`;
    let savevalues=[img_url,title,auther,description];
    console.log("savevalues");

    console.log(req.body);
    client.query(SQL,savevalues)
    .then(()=>{
        
        res.redirect("/");
    });
}

function home(req,res){
    let SQL=`SELECT * FROM bookspr;`;
    client.query(SQL)
    .then(data=>{
        // console.log(data.rows);
        res.render("pages/searches/index",{book:data.rows});
    });
}

function vewidetails(req,res){
    let SQL=`SELECT * FROM bookspr WHERE id=$1;`;
    // let id = req.params;
    let savevalue=[req.params.id];
    console.log(savevalue);
    client.query(SQL,savevalue)
    .then(data=>{
    res.render('pages/books/detail',{book:data.rows[0]});
    });
}

function updatebook(req,res){
    let {img_url,title,auther,description} = req.body;
    let id = req.params.id;

    let SQL= `UPDATE bookspr SET img_url=$1,title=$2,auther=$3,description=$4 WHERE id=$5;`;
    let savevalues=[img_url,title,auther,description,req.params.id];
    client.query(SQL,savevalues)
    .then(()=>{
        res.redirect(`/details/${id}`);

    });

}
function deletebook(req,res){
    let SQL= `DELETE FROM bookspr WHERE id=$1;`;
    let savevalues=[req.params.id];
    client.query(SQL,savevalues)
    .then(()=>{
        res.redirect(`/`);
    });


}

client.connect()
    .then(() => {
        app.listen(PORT, () =>
            console.log(`listening on ${PORT}`)
        );

    });