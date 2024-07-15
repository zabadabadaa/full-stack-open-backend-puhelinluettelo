require('dotenv').config() //ympäristömuuttujien hallinta
const express = require('express')
const morgan = require('morgan') //infoa konsoliin
const cors = require('cors')

const Person = require('./models/person') //Person on moduuli, joka määrittää yhteys tietokantaan

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('data', function (req) { //omatekoinen token,
    //tulostaa konsoliin tiedot, kun dataa postataan

    // jos ei laiteta ehtoa tulostuu tyhjä objekti, kun dataa ei ole
    const keys = Object.keys(req.body).length
    if (keys > 0){
        return JSON.stringify(req.body)
    } else {
        return
    }
})

app.use(morgan(function (tokens, req, res) {
    //nämä tulostuvat aina http pyynnön yhteydessä konsoliin
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.data(req)
    ].join(' ')
  }))


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${Date()}</p>
        `)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
  })

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })


app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body.name)

    const person = new Person({
        name: body.name,
        number: body.number,
      })

    person.save().then(result => {
        console.log('person saved!')
      })  
})


const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})