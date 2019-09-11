'use strict';

const express = require('express');
const app = express();

const PORT = process.env.AWSPORT;
// Don't hard code this if you want to deploy.
/** 
I recommend changing the static path to be './public'.
This will break things if your don't run node with a specific path to this file.
*/
app.use(express.static('./public')); // this path should be relative to this file.

app.listen(PORT, () => {
  console.log('Web Server up on port', PORT);
});
