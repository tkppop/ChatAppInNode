const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ( {id,username,room} ) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    // Validate data
    if (!username || !room) {
        return {
            error : 'Username & room are required'
        }
    }

    // Check for existing user
    const existing = users.find( (user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existing) {
        return {
            error : 'username is in use'
        }
    }

    //Store user
    const user = {id,username,room}
    users.push(user)
    return {user}

}

const removeUser = (id) => {
    const index = users.findIndex( (user) => user.id === id)
    if (index !== -1) {
        // returns array of deleted items, thats why we are returning the 0th position
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    // const index = users.findIndex( (user) => user.id === id)
    // if (index !== -1) {
    //     return users[index]
    // }
    //other way
    return users.find((user) => user.id === id )
}

const getUsersInRoom = (roomName) => {
    const usersInRoom = users.filter ((user) => user.room === roomName)
    return usersInRoom
}

module.exports = {
    addUser,
    getUser,
    removeUser,
    getUsersInRoom
}

//Testing the methods

// addUser( {
//     id:22,
//     username: 'Andy',
//     room: 'room1'
// })
// const result = addUser( {
//     id:22,
//     username: 'Andy',
//     room: 'room1'
// })

// const result1 = addUser( {
//     id:22,
//     username: '',
//     room: 'room1'
// })

// addUser( {
//     id:23,
//     username: 'PK',
//     room: 'room1'
// })

// addUser( {
//     id:24,
//     username: 'TK',
//     room: 'room1'
// })

// console.log('Adding a user with upper case', users, result)
// console.log('Adding a user with no username', users, result1)
// console.log('starting test array', users )

// const removedUser = removeUser(22)
// console.log('deleted user', removedUser)

// console.log('Remaining user', users)

// console.log('getUser ',getUser(24))
// console.log('getUser ',getUser(25))
// console.log('getUsersInRoom',getUsersInRoom('room1'))
