const express = require('express');
const app = express();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/icecream_db');
const PORT = process.env.PORT || 3000;

app.use(require('morgan')('dev'));

// Parse the body
app.use(express.json());

//ROUTES    


//GET ALL THE FLAVORS
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
});

// RETURN SINGLE flavors
app.get('/api/flavors/:id', async (req,res, next)=> {
    const id = req.params.id;

    try{
        const SQL = `
            SELECT * FROM flavors WHERE id = $1;
        `
        const response = await client.query(SQL, [id]);
        res.send(response.rows);
    } catch(err) {
        next(err)
    }
});

//Create Flavor
app.post('/api/flavors', async (req, res, next) => {
  try {
    const name = req.body.name;
    const isFavorite = req.body.isFavorite || false;

    const SQL = `
      INSERT INTO flavors(name, is_favorite) VALUES($1, $2)
      RETURNING *
    `;

    const response = await client.query(SQL, [name, isFavorite]);

    res.send(response.rows);  
  } catch (err) {
    next(err); 
  }
});

//DELETE
app.delete('/api/flavors/:id', async (req,res,send) => {
    try {
        const SQL = `
            DELETE FROM flavors WHERE id = $1;
        `
        await client.query(SQL,[req.params.id]);
        res.sendStatus(204);
    }catch(err) {
        next(err);
    }
})
// Update route
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const {name} = req.body;
        const isFavorite = req.body?.isFavorite ?? false;
        const SQL = `
            UPDATE flavors
            SET name = $1, is_favorite = $2, updated_at=now() WHERE id = $3
        
            RETURNING *
        `;
        const response = await client.query(SQL, [name, isFavorite, id]);
        if (response.rowCount === 1) {
            res.send(response.rows[0]); // Send the updated flavor data
        } else {
            res.status(404).send('Flavor not found'); // Handle non-existent flavor
        }
    } catch (err) {
        next(err); // Pass error to error handler middleware
    }
});
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