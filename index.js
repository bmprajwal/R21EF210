const express = require('express')
const router = require('./routes')

const app = express()

app.use('/numbers', router)

const PORT = 9876
app.listen(PORT, ()=> {
  console.log(`Server listening on ${PORT}`);
})