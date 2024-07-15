// Tässä tietokantayhteys mongoDB Atlas
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI //osoitetietokanattan ympäristömuuttujana


console.log('connecting to', url)
mongoose.connect(url)

  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
    validate: {
      validator: (v) => /^\d{2,3}-\d{5,}$/.test(v),
      message: props => `${props.value} phone number must start with 2-3 numbers and then hyphen (-)`,
    }
  }

})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)