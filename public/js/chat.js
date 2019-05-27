//io is method that comes with socket.io.js script
const socket = io()

//Elements
const $messageForm = document.querySelector('#inputform')
const $messageFormInput = $messageForm.querySelector('#inputMsg')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
//location.search contains the searched query string that is parse by QS script
//ignoreQueryPrefix ingores the '?' that comes along with the query string (Qs)
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const $newMessageheight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visisbleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight
    
    // How far have I scolled
    const scrollOffset = $messages.scrollTop + visisbleHeight

    if (containerHeight - $newMessageheight <= scrollOffset) {
        // scroll to the bottom
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('joinMessage', (msg) => {
    //console.log(msg)
    //combine the template with the message data
    // Mustache is an object we get along the Mustache scipt
    const html = Mustache.render(messageTemplate, { 
        username : msg.username,
        message: msg.text, 
        //// Monment is a method we get along the Moment scipt that used to maipulate date variable
        createdAt : moment(msg.createdAt).format('M/D ddd h:mm a') 
    })
    $messages.insertAdjacentHTML('beforeend', html)

})

// Refactored to get these elements in 'e' object
//const inputVal = document.querySelector('#inputMsg')

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable button using dom manipulation
    $messageFormButton.setAttribute('disabled', 'disabled')
    //socket.emit('sendMessage', inputVal.value )
    // Another way to access the input from the form
    const message = e.target.elements.message.value
    //For message acknowledgements, the last argument is the callback function to run.
    socket.emit('sendMessage', message, (error) => {
        //remove attribute using dom manipulation
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('Message was delivered!')
    })
})


socket.on('sendAll', (msg) => {
    //console.log('New incoming messgage: ' , msg)
    const html = Mustache.render(messageTemplate, { 
        username : msg.username,
        message: msg.text, 
        createdAt : moment(msg.createdAt).format('M/D ddd h:mm a') 
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('sendLocationAll', (msg) => {
    //console.log('New incoming location: ' , msg)
    const html = Mustache.render(locationTemplate, { 
        username : msg.username,
        url: msg.url,
        createdAt: moment(msg.createdAt).format('M/D ddd h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    //console.log(room)
    //console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated! ' , count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    //This function call is an async call that does not support promises, so we cannot user async/await
    // and hence we are going for a traditional callback function.
    navigator.geolocation.getCurrentPosition( (postition) => {
        //console.log(postition)
        //console.log(postition.coords.latitude)
        socket.emit('sendLocation', { 
            lat: postition.coords.latitude,
            long: postition.coords.longitude,
            time: postition.timestamp 
        }, () => {
            //callback for acknowledgement 
            //console.log('Location Shared!')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room} , (error) => {
    if (error) {
        alert(error)
        // this is to send them to the room of the page
        location.href = '/'
    }
    //console.log(error)
})