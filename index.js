const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.json())

morgan.token('data', function (req) {
    //const method = JSON.stringify(req.method)
    //console.log(method)

    // jos ei laiteta ehtoa tulostuu tyhjä objekti, kun dataa ei ole
    const keys = Object.keys(req.body).length
    if (keys > 0){
        return JSON.stringify(req.body)
    } else {
        return
    }
})

app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.data(req)
    ].join(' ')
  }))

let persons = [
      {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": "1"
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": "2"
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": "3"
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423666",
        "id": "4"
      }
]

  
app.get('/api/persons', (request, response) => {
    response.json(persons)
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

 //https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range 
const generateId = () => {
    const min = 0 //included
    const max = 1000000 //included
    const id = Math.floor(Math.random() * (max-min+1)) + min // min=0 now!
    return String(id)
}


app.post('/api/persons', (request, response) => {
    const body = request.body
    //console.log(body.name)

    const name = request.body.name
    const existingName = persons.find(person => person.name === name)
    
    //console.log(existingName)

    if (existingName) {
        return response.status(400).json({
            error: 'name already in phonebook, use unique name',
        })
    }

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing',
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing',
        })
    }

    const person = {
        name: body.name,
        number: body.number || false,
        id: generateId(),
    }
    persons = persons.concat(person)

    response.json(person)
})
  
const PORT = 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})