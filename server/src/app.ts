import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mysql from 'mysql';

const app: Express = express();
dotenv.config(); 
/* There should be a .env file in '../dist' directory, containing following variables:
PORT - localhost port the server will be running on.
CONNECTION_STRING - the connection string to connect to MySQL database
*/

const connection = mysql.createConnection(process.env.CONNECTION_STRING!);
connection.connect();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/getTable', (request, response) => {
    connection.query('SELECT * FROM test', (error, result) => {
        if (error) throw error;
        response.json(result);            
})});

app.listen(process.env.PORT, () => {
    console.log(`Server has started on PORT ${process.env.PORT}`)
});