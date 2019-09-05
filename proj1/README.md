## For development
1) Install MongoDB
https://docs.mongodb.com/manual/administration/install-community/

2) Create a folder to store the database data
e.g. C:/data/db

3) Start the mongoDB daemon
e.g. `C:/Program Files/MongoDB/Server/4.0/bin/mongod --dbpath C:/data/db`

4) Start the mongoDB application
e.g. `C:/Program Files/MongoDB/Server/4.0/bin/mongo`

5) Build (Has to do ng build every time we make a change)
e.g. `ng build`

6) Run server and host
e.g. `npm start`

If we are developing then skip step 5 + 6 and do
`ng serve -o`
then navigate to the server folder and do
`node server.js`
Might run into CORS/SSL verification issues tho.
