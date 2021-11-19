const express = require('express');

const PORT = 3333

const app = express();
app.use(express.json())

app.get('/ping', (req, res) => {
    return res.send({message: 'pong'})
})

app.post('/account', (req, res) => {

})

app.listen(PORT)
