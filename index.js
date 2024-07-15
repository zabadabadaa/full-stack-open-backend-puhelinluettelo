const express = require('express')
const app = express()
require('dotenv').config() //ympäristömuuttujien hallinta

const Person = require('./models/person') //Person on moduuli, joka määrittää yhteys tietokantaan

app.use(express.static('dist'))

const morgan = require('morgan') //infoa konsoliin

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

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message})
    }
  
    next(error)
  }

const cors = require('cors')
app.use(cors())
app.use(express.json())

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

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    Person.countDocuments({}).then(result =>{
        response.send(`
                    <p>Phonebook has info for ${result} people</p>
                    <p>${Date()}</p>
                `)
        console.log("Tietokannassa dokumentteja", result)
    })  
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    
    Person.findById(id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end() //tänne jos id ei löydy
            }
        })
        .catch(error => next(error)) //tämä jos id väärässä muodossa
    
  })

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
  })


app.post('/api/persons', (request, response, next) => {
    const body = request.body
    //console.log(body.name)

    if(body.name === "") {
        console.log("ei nimeä")
        return response.status(400).json({
            error: 'name missing'
        })
    }
    
    if(body.number === "") {
        console.log("ei numeroa")
        return response.status(400).json({
            error: 'number missing'
        })
    } 

    const person = new Person({
        name: body.name,
        number: body.number,
      })

    person.save().then(result => {
        response.json(result)
        console.log('person saved!')
      })
      .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    console.log(body)
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})