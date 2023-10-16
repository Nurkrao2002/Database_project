var pool = require("./connection")
const express = require('express');
const multer = require('multer');
const { Pool } = require('pg');
const fs = require('fs');
const util = require('util');

const app = express();
const upload = multer({ dest: 'uploads/' });
const readFile = util.promisify(fs.readFile);

var bodyparser = require("body-parser");
const { count } = require("console");

app.use(bodyparser.json());

app.use(bodyparser.urlencoded({ extended:true}));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(__dirname + '/public'));



const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'UDAY',
  password: '1234',
  port: 5432,    // Default PostgreSQL port is 5432
};



pool.connect((err, client, done) => {
    if (err) {
      console.error('', err);
      // Redirect to another page
      app.get('/', (req, res) => {
        res.redirect('/error');
        
      });
    } else {
      console.log('Connected to database');
      // Continue with your application logic
      app.get('/', (req, res) => {
      //   res.render(__dirname +"/search-students.ejs");
      // res.send('database error. Please try again later.....!');
      return res.redirect('/home');
      });
    }
  });


  app.get('/error', (req, res) => {
    //   res.send('database error. Please try again later.....!');
    //   res.render(__dirname +"/error.ejs");
      // return res.redirect('/error');
      res.redirect(__dirname +"/error.ejs");
    });

    app.get('/home', (req, res) => {
        res.render(__dirname+"/home.ejs");
        // res.send('/index.ejs')
      });



      app.get("/",function(req, res){
        pool.connect(function(error){
            if(error) console.log(error);
      
            var postgres = "SELECT datname FROM pg_database WHERE datistemplate = false"; 
      
            pool.query(postgres,function(error, result){
            if(error) console.log(error); 
            // console.log(result);
            res.render(__dirname+"/home.ejs",{database:result.rows});
          
      
            });
        });
      });

      app.get("/fruits",function(req, res){
        pool.connect(function(error){
            if(error) console.log(error);
    
            var postgres = "SELECT * FROM public.udayram"; 
    
            pool.query(postgres,function(error, result){
            if(error) console.log(error); 
            // console.log(result);
            res.render(__dirname+"/fruits.ejs",{students:result});   
            });
        });
    });

    app.get('/fruits', (req, res) => {
      res.render(__dirname+"/fruits.ejs");
      // res.send('/dtafruits.ejsa')
    });
  
// --------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/home.ejs');
});

app.post('/upload', upload.single('sqlFile'), async (req, res) => {
  try {
      const fileData = await readFile(req.file.path, 'utf-8');
      const sqlQueries = fileData.split(';');

      const pool = new Pool(dbConfig);

      const queryResults = [];

      for (const query of sqlQueries) {
        if (query.trim() !== '') {
            try {
                const { rows } = await pool.query(query);
                queryResults.push(rows);
            } catch (error) {
                console.error('Error executing SQL:', error);
                res.status(500).send('Error executing SQL');
            }
        }
    }
    pool.end();
    res.render('results', { data: queryResults });
} catch (err) {
    console.error('Error reading SQL file:', err);
    res.status(500).send('Error reading SQL file');
}
});



      app.listen(7000, function(){
        console.log("Sever Is Connected....at port no - 7000!")
    });

   
