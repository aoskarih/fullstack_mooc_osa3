import { useState, useEffect } from 'react'
import service from './services/comm'

const Person = ({ setMessage, person, personSetter }) => {
  const handleClick = () => {
    if (window.confirm(`Do you really want to delete person ${person.name}?`)) {
      service.deletePerson(person.id)
        .then(_ => {
          console.log("Person deleted", person);
          setMessage(`Deleted ${person.name}`)
          service.getPersons()
            .then(data => {
              personSetter(data)
            })
        })
    }
  }

  return (
    <>
    {person.name} {person.number}
    <button onClick={handleClick}>delete</button>
    <br />
    </>
  )
}

const Persons = ({ setMessage, filterStr, persons, personSetter }) => {
  const filterShown = () => {
    return persons.filter(p => p.name.includes(filterStr))
  }
  return (
    <>
      {filterShown().map(p => <Person key={p.name} setMessage={setMessage} person={p} personSetter={personSetter}/>)}
    </>
  )
}

const PersonForm = ({ setErrMessage, setMessage, persons, personSetter, newNumber, newName, numberSetter, nameSetter}) => {
  const nameInBook = () => {
    let bool = persons.reduce((p, c) => c.name===newName || p, false)
    return bool
  }
  const getId = () => {
    return persons.reduce((p, c) => c.name===newName ? c.id : p, -1)
  }

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber,
    }

    if (nameInBook()) {
      if (window.confirm(`${newName} is already added to phonebook. Do you want to update the number?`)) {
        service.updatePerson(getId(), personObject)
          .then(response => {
            console.log("Person updated", response)
            setMessage(`Updated ${newName}`)
            service.getPersons()
              .then(data => {
                personSetter(data)
              })
            nameSetter('')
            numberSetter('')
          })
          .catch(error => {
            setErrMessage(error.response.data.error)
          })
      }

      return
    }

    service.addPerson(personObject)
      .then(response => {
        console.log("Person added", response)
        setMessage(`Added ${newName}`)
        service.getPersons()
          .then(data => {
            personSetter(data)
          })
        nameSetter('')
        numberSetter('')
      }).catch(error => {
        console.log(error);
        setErrMessage(error.response.data.error)
      })

  }
  const handleNameChange = (event) => {
    nameSetter(event.target.value)
  }
  const handleNumberChange = (event) => {
    numberSetter(event.target.value)
  }
  return (
    <>
    <form onSubmit={addPerson}>
      <div>
        name: <input 
          value={newName}
          onChange={handleNameChange}
        /><br />
        number: <input 
          value={newNumber}
          onChange={handleNumberChange}
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
    </>
  )
}

const Filter = ({ filterStr, filterSetter }) => {

  const setFilter = (event) => {
    filterSetter(event.target.value)
  }

  return (
    <>
      filter shown with <input
        value={filterStr} 
        onChange={setFilter}
      />
    </>
  )
}

const Notification = ({ message, setMessage, isError }) => {
  
  if (message !== null) {
    setTimeout(() => {
      setMessage(null)
    }, 4000)
  }
  
  if (message === null) {
    return null
  }
  
  const notificationStyle = {
    color: isError ? 'red' : 'green',
    background: isError ? 'pink' : 'lightgreen',
    fontWeight: 'bold',
    fontSize: 25,
    borderStyle: 'solid',
    borderRadius: 3,
    padding: 10
  }

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}


const App = () => {

  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  
  const [filterStr, setFilterStr] = useState('')
  const [message, setMessage] = useState(null)
  const [errMessage, setErrMessage] = useState(null);

  useEffect(() => {
    service.getPersons().then(data => {
        setPersons(data)
    })
  }, [])

  return (
    <div>
      <h1>Phonebook</h1>
      <Notification message={message} setMessage={setMessage} isError={false}/>
      <Notification message={errMessage} setMessage={setErrMessage} isError={true}/>
      <br />
      <Filter  
        filterSetter={setFilterStr}
        filterStr={filterStr}
      />
      <h2>add a new</h2>
      <PersonForm 
        newName={newName} 
        newNumber={newNumber}
        persons={persons}
        nameSetter={setNewName} 
        numberSetter={setNewNumber} 
        personSetter={setPersons}
        setMessage={setMessage}
        setErrMessage={setErrMessage} 
      />
      <h2>Numbers</h2>
      <Persons 
        setMessage={setMessage}
        persons={persons}
        personSetter={setPersons} 
        filterStr={filterStr} 
      />
    </div>
  )
}

export default App
