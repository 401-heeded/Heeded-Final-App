'use strict';

const express = require('express');
const app = express();
// Don't hard code this if you want to deploy.
const PORT = 8080;

/** 
I recommend changing the static path to be './public'.
This will break things if your don't run node with a specific path to this file.
*/
app.use(express.static('./front-end/public')); // this path should be relative to this file.

app.listen(PORT, () => {
  console.log('Web Server up on port', PORT);
});
