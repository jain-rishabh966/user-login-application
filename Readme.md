# User Login Application
#### _Lendbox Assignment_

This is a small project using Express.js and MySQL.

### Libraries Used
- [sha256] - I used this for hashing and saving passwords
- [express-session] - This was used for session management
- [mysql] - This was used for establishing a connection with the database and querying it
- [moment] - This was used as a date formatter as it is fairly easy to use
- [Express] - fast node.js network app framework

### Steps to run the project

This application requires [Node.js](https://nodejs.org/) to run.

In `resources` folder, please run the `InitDatabase.sql` script in MySQL server.

Install the dependencies.

```sh
cd user-login-application
npm install
```

Now locate the `local.js` file in the root folder of the application and edit it according to your requirements.
Now, run the server using the following command.

```sh
node app
```

#### End Points

- POST /users/register/1 -> Accepts the mobile and name parameters and saves them in session
- POST /users/register/2 -> Accepts the email and password parameters and saves them in session (saved password will be hashed using sha256)
- POST /users/register/3 -> Accepts the fathers name, dob and PAN parameters and saves them in the database
- POST /users/logout -> This will end an existing session
- GET /users/login

Verify the deployment by navigating to your server address in
your preferred browser.

```sh
http://127.0.0.1:3000
```

The final step is to check the application using Postman. For that, we will need to go to `Postman`.
Now use the following steps:

- Go to `File>Import>Folder` and navigate to the `user-login-application` folder. In there, go to resources and import the file `User_login_app.postman_collection`. This will give you the collection of requests needed to run.
- Run the requests in the following order
-- POST /users/register/1
-- POST /users/register/2
-- POST /users/register/3
-- POST /users/login

---

Finally, I would like to thank you guys for the opportunity. I learnt a couple of things form this mini-project itself.
Rishabh Jain

[express]: <http://expressjs.com>
[moment]: <https://www.npmjs.com/package/moment/v/1.1.0>
[mysql]: <https://www.npmjs.com/package/mysql#introduction>
[sha256]: <https://www.npmjs.com/package/sha256>
[express-session]: <https://www.npmjs.com/package/express-session>
