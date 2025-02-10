document.addEventListener('DOMContentLoaded', function() {
    const Video = document.getElementById('StartView');
    Video.muted = true;
    Video.play(); // Reproduce el video automáticamente

    // Reinicia el video cuando termina
    Video.addEventListener('ended', function() {
        Video.currentTime = 0; // Reinicia el tiempo al inicio
        Video.play(); // Reproduce el video nuevamente
    });
});

