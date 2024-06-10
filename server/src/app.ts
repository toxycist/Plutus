import express, { Express } from 'express';
import session from 'express-session';
const MemoryStore = require('memorystore')(session)
import dotenv from 'dotenv';
import cors from 'cors';
import mysql from 'mysql';
import authProvider from './MS_auth_provider/MS_auth_provider';

const app: Express = express();
dotenv.config()
/* There should be a .env file in '../dist' directory, containing following variables:
PORT - a port the server will be running on.
HOST_ADDRESS - the address of the hosted frontend (web server, should not end with a trailing slash)
CONNECTION_STRING - the connection string to connect to MySQL database
TABLE_NAME - name of the table in the database

As described in the Microsoft Authentication Provider configuration:

CLOUD_INSTANCE - Microsoft endpoint which will authenticate users (should end with a trailing slash)
TENANT_ID - can be viewed in Entra
CLIENT_ID - can be viewed in Entra
CLIENT_SECRET - can be viewed in Entra

REDIRECT_URI - a URI that will receive encoded user data after login
POST_LOGOUT_REDIRECT_URI - not configured yet

GRAPH_API_ENDPOINT - I guess it is always the same: "https://graph.microsoft.com/" (should end with a trailing slash)
EXPRESS_SESSION_SECRET - self-explanatory

ADMIN_LIST - a string containing emails of all the admins separated from each other by ' '
*/

const connection = mysql.createConnection(process.env.CONNECTION_STRING!);

app.use(cors({credentials: true, origin: `${process.env.HOST_ADDRESS}`}));
app.use(session({
    store: new MemoryStore({
        checkPeriod: 1000 * 60 * 60 * 24 * 7
    }),
    secret: process.env.EXPRESS_SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: false, // set this to true on production
    }
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/authCheck', (request, response) => {
    (request.sessionStore.all as any)((error: any, sessions: any) => {response.json(request.session.id in sessions)});
})

app.get('/getElements', (request, response) => {
    try {
        if(request.query.mode){
            if ((request.query.mode as string).includes('reservationhistory') || (request.query.mode as string).includes('name')){
                connection.query(`SELECT * FROM ${process.env.TABLE_NAME} WHERE ${(request.query.mode as string).split('=')[0]} LIKE '%${(request.query.mode as string).replaceAll("'", "").split('=')[1]}%'`, (error, result) => {
                    if (error) throw error;
                    response.json(result)});
                    return;
            }
        }

        connection.query(`SELECT * FROM ${process.env.TABLE_NAME}` + (request.query.mode ? ` WHERE ${request.query.mode}` : ''), (error, result) => {
            if (error) throw error;
            response.json(result)});
    } catch (error) {
        console.log(response.statusCode);
    }
});

app.get('/addElement', (request, response) => {
    connection.query(`INSERT INTO ${process.env.TABLE_NAME} (name, originRoom) VALUES ("${request.query.name}", ${request.query.originRoom})`, (err) => {         
        if (err) response.json({status: `${err.code}`})
        else response.json({status: "success"})})
})

app.get('/truncateTable', (request, response) => {
    connection.query(`TRUNCATE TABLE ${process.env.TABLE_NAME}`, (err) =>{
        if (err) response.json({status: `${err.code}`})
        else response.json({status: "success"})})
})

app.patch("/editElement/:id", (request, response) => {
    connection.query(`UPDATE ${process.env.TABLE_NAME} SET name="${request.body.name}", originRoom=${request.body.originRoom} WHERE id=${request.params.id}`, (error) => {
        if (error) response.json({status: `${error.code}`})
        else response.json({status: "success"})});
})

app.delete("/deleteElement/:id", (request, response) => {
    try {
        connection.query(`DELETE FROM ${process.env.TABLE_NAME} WHERE id=${request.params.id}`, (error) => {
            if (error) {
                response.json({status: "fail"})
                throw error
            }
            response.json({status: "success"})});
    } catch (error) {
        console.log(response.statusCode);
    }
})

app.get('/login', authProvider.login({
    scopes: ['User.Read'],
    redirectUri: process.env.REDIRECT_URI,
    successRedirect: '/fork'
}));

app.post('/decode-user-data', authProvider.handleRedirect())

app.get('/fork', (req, res) => {
    res.redirect(process.env.ADMIN_LIST?.split(" ").includes((req.session as any).account.username ) ? `${process.env.HOST_ADDRESS}/admin_page.html` : `${process.env.HOST_ADDRESS}/user_page.html`)
})

app.get('/logout', authProvider.logout({postLogoutRedirectUri: process.env.POST_LOGOUT_REDIRECT_URI}))

app.listen(process.env.PORT, () => {
    console.log(`Server has started on PORT ${process.env.PORT}`)
});