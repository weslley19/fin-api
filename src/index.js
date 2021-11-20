const express = require('express');
const { v4: uuidv4 } = require('uuid')

const PORT = 3333

const app = express();
app.use(express.json())

const costumers = [];

function verifyExistsCostumerCpf(req, res, next) {
  const { cpf } = req.headers;

  const costumer = costumers.find((costumer) => costumer.cpf == cpf)

  if (!costumer) {
    return res.status(400).send({ message: 'Costumer not found' });
  }

  req.costumer = costumer;

  return next()
}

function getBalance(costumer) {
  const balance = costumer.statement.reduce((acc, item) => {
    return acc += item.amount
  }, 0)

  return balance;
}

app.get('/ping', (req, res) => {
  return res.send({ message: 'pong' })
})

app.post('/account', (req, res) => {
  const { name, cpf } = req.body;

  const costumer = {
    name,
    cpf,
    id: uuidv4(),
    statement: []
  }

  const verifyExistsAccount = costumers.some(costumer => costumer.cpf === cpf)

  if (verifyExistsAccount) {
    return res.status(400).send({ message: 'Account already exists' })
  }

  costumers.push(costumer)

  return res.status(201).send({ message: 'Account created successfully', data: costumers })
})

app.get('/costumer', verifyExistsCostumerCpf, (req, res) => {
  const { costumer } = req;
  return res.status(200).send({ message: 'Costumer found', data: costumer })
})

app.get('/statement', verifyExistsCostumerCpf, (req, res) => {
  const { costumer } = req;
  return res.status(200).send({ message: 'Costumer found', statement: costumer.statement })
})

app.get('/statement/date', verifyExistsCostumerCpf, (req, res) => {
  const { costumer } = req;
  const { date } = req.query

  const dateFormat = new Date(date + ' 00:00')

  const statement = costumer.statement.filter(costumer => costumer.createdAt.toDateString() == dateFormat.toDateString())
  console.log(statement)

  if (statement.length > 0) {
    return res.status(200).json({ message: 'Costumer found', data: statement })
  }

  return res.status(404).json({ message: 'Costumer not found'})
})

// deposit | withdraw
app.post('/movement', verifyExistsCostumerCpf, (req, res) => {
  const { costumer } = req;
  const { amount, type, description } = req.body

  if (type === 'deposit') {
    if (amount > 0) {
      const statementOperation = {
        amount,
        type,
        description,
        createdAt: new Date()
      }

      costumer.statement.push(statementOperation)

      return res.status(201).send({ message: 'Deposit accomplished successfully', data: costumer })
    }
  } else {
    const balance = getBalance(costumer)

    if (balance < amount) {
      return res.status(400).send({ message: 'Insufficient balance' })
    }

    const statementOperation = {
      amount,
      type,
      createdAt: new Date()
    }

    costumer.statement.push(statementOperation)

    return res.status(200).send({ message: 'Successful withdrawal', data: costumer })
  }

  return res.status(400).send({ message: 'Error when depositing' })
})

app.put('/account', verifyExistsCostumerCpf, (req, res) => {
  const { name } = req.body
  const { costumer } = req;

  costumer.name = name

  return res.status(200).send({ message: 'Costumer updated successfully', data: costumer })
})

app.listen(PORT)
