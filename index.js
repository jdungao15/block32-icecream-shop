const express = require('express');
const app = express();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/icecream_db');
const PORT = process.env.PORT || 3000;

app.use(require('morgan')('dev'));

//ROUTES    


//GET
app.get('/api/flavors', async (req,res,next)=> {
    try {
        const SQL = `
            SELECT * FROM flavors;        
        `
        const response = await client.query(SQL);
        res.send(response.rows)
    } catch(err) {
        next(err);
    }
})


const init = async () => {
    await client.connect();
     let SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            is_favorite BOOLEAN DEFAULT 'false',
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        
    );
  `
    await client.query(SQL)
    console.log('connected to db');
    SQL = `
           INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', true);
           INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', false);
           INSERT INTO flavors(name) VALUES('Cookies and Cream');
           
    
    `
    await client.query(SQL);


    app.listen(PORT, () => {
        console.log(`listening on PORT ${PORT}`)
    });
}


init();