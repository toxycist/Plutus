import express, { Express } from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import mysql from 'mysql';
import authProvider from './MS_auth_provider/MS_auth_provider';

const app: Express = express();
dotenv.config()
/* There should be a .env file in '../dist' directory, containing following variables:
PORT - localhost port the server will be running on.
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
connection.connect();

app.use(cors());
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set this to true on production
    }
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/getElements', (request, response) => {
    try {
        connection.query(`SELECT * FROM ${process.env.TABLE_NAME}` + (request.query.mode ? ` WHERE ${request.query.mode}` : ''), (error, result) => {
            if (error) throw error;
            response.json(result)});
    } catch (error) {
        console.log(response.statusCode);
    }
});

app.get('/addElement', (request, response) => {
    try {
        connection.query(`INSERT INTO ${process.env.TABLE_NAME} VALUES ()`, (error) => {
            if (error) throw error;
            response.json({success: true})});
    } catch (error) {
        console.log(response.statusCode);
    }
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
    res.redirect(process.env.ADMIN_LIST?.split(" ").includes((req.session as any).account.username ) ? "http://localhost/admin_page.html" : "http://localhost/user_page.html")
})

app.get('/logout', authProvider.logout({postLogoutRedirectUri: process.env.POST_LOGOUT_REDIRECT_URI}))

app.listen(process.env.PORT, () => {
    console.log(`Server has started on PORT ${process.env.PORT}`)
});