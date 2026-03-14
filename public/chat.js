// Make connection
const socket = io.connect();

// Query DOM
const message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      btn = document.getElementById('send'),
      output = document.getElementById('output'),
      feedback = document.getElementById('feedback');

// Emit events
btn.addEventListener('click', function(){
    socket.emit('chat', {
        message: message.value,
        handle: handle.value
    });
    message.value = "";
});

message.addEventListener('keypress', function(){
    socket.emit('typing', handle.value);
})

// Listen for events
socket.on('chat', function(data){
    feedback.innerHTML = '';

    const my_handle = handle.value;
    const is_mine   = data.handle == my_handle;

    // format timestmap
    const time = data.timestamp 
        ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });



    output.innerHTML += `
    <div class="msg-wrapper ${is_mine ? 'mine' : 'theirs'}">
        <strong class="handle">${data.handle}</strong>
        <p class="${is_mine ? 'mine' : 'theirs'}">
            ${data.message}
            <span class="timestamp">${time}</span>
        </p>
    </div>`;
    const chat_window = document.getElementById('chat-window');
    chat_window.scrollTop = chat_window.scrollHeight;

});

socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});