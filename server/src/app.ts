import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

const app: Express = express();
dotenv.config(); 
/* There should be a .env file in '../dist' directory, containing following variables:
PORT - localhost port the server will be running on.
*/
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/getTable', (request, response) => {
    response.json([
        { id: 1, dateAdded: new Date() },
        { id: 2, dateAdded: new Date() },
        { id: 3, dateAdded: new Date() }
    ])
});

app.listen(process.env.PORT, () => {
    console.log(`Server has started on PORT ${process.env.PORT}`)
});