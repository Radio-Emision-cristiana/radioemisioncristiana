// ========================================
// REPRODUCTOR ULTRA SIMPLE - SOLO LO ESENCIAL
// ========================================

console.log('🚀 Cargando reproductor ultra simple...');

// VERIFICAR QUE LOS ELEMENTOS EXISTAN
const audio = document.getElementById('audio-player');
const miniPlayButton = document.getElementById('mini-play-button');
const miniVolumeSlider = document.getElementById('mini-volume-slider');
const miniEqualizerContainer = document.querySelector('.mini-equalizer-container');
const liveIndicator = document.querySelector('.live-indicator');

console.log('🔍 Audio element:', audio ? 'FOUND' : 'NOT FOUND');
console.log('🔍 Play button:', miniPlayButton ? 'FOUND' : 'NOT FOUND');
console.log('🔍 Volume slider:', miniVolumeSlider ? 'FOUND' : 'NOT FOUND');

// Elementos de metadata
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const albumCover = document.getElementById('album-cover');
const miniSongTitle = document.getElementById('mini-song-title');
const miniArtistName = document.getElementById('mini-artist-name');
const miniAlbumCover = document.getElementById('mini-album-cover');

console.log('🔍 Song title element:', songTitle ? 'FOUND' : 'NOT FOUND');
console.log('🔍 Artist element:', artistName ? 'FOUND' : 'NOT FOUND');

let isPlaying = false;
let playlist = [];
let currentSongIndex = 0;

// ========================================
// FUNCIONES DE METADATA
// ========================================

function updateMetadata(title, artist, coverUrl = 'portada.jpg') {
    console.log('📄 Actualizando metadata:', title, '-', artist);
    
    // Actualizar reproductor principal
    if (songTitle) songTitle.textContent = title;
    if (artistName) artistName.textContent = artist;
    if (albumCover) albumCover.src = coverUrl;
    
    // Actualizar mini reproductor
    if (miniSongTitle) miniSongTitle.textContent = title;
    if (miniArtistName) miniArtistName.textContent = artist;
    if (miniAlbumCover) miniAlbumCover.src = coverUrl;
    
    console.log('✅ Metadata actualizada');
}

function fetchItunesData(artist, title) {
    const itunesApiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(artist + ' ' + title)}&entity=song&limit=1`;
    
    console.log('🍎 Buscando carátula en iTunes para:', artist, '-', title);
    
    return fetch(itunesApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                console.log('✅ Carátula encontrada en iTunes');
                return data.results[0];
            }
            console.log('⚠️ No se encontró carátula en iTunes');
            return {};
        })
        .catch(error => {
            console.error('❌ Error fetching iTunes data:', error);
            return {};
        });
}

function fetchAlbumCover(artist, title) {
    fetchItunesData(artist, title).then(data => {
        if (data.artworkUrl100) {
            const albumCoverUrl = data.artworkUrl100.replace('100x100', '600x600');
            console.log('🖼️ Actualizando carátula:', albumCoverUrl);
            updateMetadata(title, artist, albumCoverUrl);
        } else {
            console.log('📷 Usando carátula por defecto');
            updateMetadata(title, artist, 'portada.jpg');
        }
    });
}

function startMetadataUpdates() {
    console.log('📡 Iniciando conexión a metadata en tiempo real...');
    
    const eventSource = new EventSource('https://api.zeno.fm/mounts/metadata/subscribe/yg7bvksbfwzuv');

    eventSource.onmessage = function(event) {
        console.log('📨 Metadata recibida:', event.data);
        
        try {
            const data = JSON.parse(event.data);
            if (data.streamTitle) {
                console.log('🎵 Nueva canción:', data.streamTitle);
                
                const parts = data.streamTitle.split(' - ');
                if (parts.length >= 2) {
                    const artist = parts.pop();
                    const title = parts.join(' - ');
                    
                    console.log('🎤 Artista:', artist);
                    console.log('🎵 Título:', title);
                    
                    // Agregar a playlist si es nueva
                    const newSong = { artist, title };
                    if (!playlist.some(song => song.artist === artist && song.title === title)) {
                        playlist.push(newSong);
                        console.log('➕ Canción agregada a playlist');
                    }
                    
                    currentSongIndex = playlist.findIndex(song => song.artist === artist && song.title === title);
                    
                    // Actualizar metadata inmediatamente
                    updateMetadata(title, artist);
                    
                    // Buscar carátula
                    fetchAlbumCover(artist, title);
                    
                } else {
                    console.log('🎵 Título simple:', data.streamTitle);
                    updateMetadata(data.streamTitle, 'Artista desconocido', 'portada.jpg');
                }
            }
        } catch (error) {
            console.error('❌ Error procesando metadata:', error);
        }
    };

    eventSource.onerror = function(error) {
        console.error('❌ Error en la conexión EventSource:', error);
        eventSource.close();
        
        // Reintentar después de 5 segundos
        setTimeout(() => {
            console.log('🔄 Reintentando conexión de metadata...');
            startMetadataUpdates();
        }, 5000);
    };
    
    console.log('✅ Conexión de metadata configurada');
}

// ========================================
// FUNCIÓN DE TEMA (MODO CLARO/OSCURO)
// ========================================

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) {
        console.log('⚠️ Botón de tema no encontrado');
        return;
    }
    
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    
    body.classList.toggle('dark-theme');
    
    if (body.classList.contains('dark-theme')) {
        // Cambiar a modo oscuro
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
        localStorage.setItem('theme', 'dark');
        console.log('🌙 Cambiado a modo oscuro');
    } else {
        // Cambiar a modo claro
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
        localStorage.setItem('theme', 'light');
        console.log('☀️ Cambiado a modo claro');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) {
        console.log('⚠️ Elementos de tema no encontrados');
        return;
    }
    
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
        console.log('🌙 Tema oscuro cargado');
    } else {
        // Modo claro por defecto
        body.classList.remove('dark-theme');
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
        console.log('☀️ Tema claro cargado');
    }
}

// ========================================
// FUNCIÓN PRINCIPAL: PLAY/PAUSE
// ========================================
function togglePlayStop() {
    console.log('🎵 Toggle play/stop - isPlaying:', isPlaying);
    
    if (isPlaying) {
        // PAUSAR
        console.log('⏸️ Pausando...');
        audio.pause();
    } else {
        // REPRODUCIR
        console.log('▶️ Reproduciendo...');
        audio.play()
            .then(() => {
                console.log('✅ Audio started successfully');
            })
            .catch(error => {
                console.error('❌ Audio error:', error);
            });
    }
}

// ========================================
// ANIMACIÓN SIMPLE DEL VISUALIZADOR
// ========================================
function activateVisualizer() {
    console.log('📊 Activando visualizador...');
    
    const bars = document.querySelectorAll('.mini-equalizer-bar');
    console.log('Barras encontradas:', bars.length);
    
    if (bars.length === 0) {
        console.error('❌ No se encontraron barras del visualizador');
        return;
    }
    
    // Activar animación CSS simple
    bars.forEach((bar, index) => {
        bar.style.animation = `fallbackEqualize ${0.8 + (index % 3) * 0.2}s ease-in-out infinite`;
        bar.style.animationDelay = `${(index * 0.03)}s`;
        bar.style.height = '';
    });
    
    console.log('✅ Visualizador activado');
}

function deactivateVisualizer() {
    console.log('📊 Desactivando visualizador...');
    
    const bars = document.querySelectorAll('.mini-equalizer-bar');
    
    bars.forEach(bar => {
        bar.style.animation = 'none';
        bar.style.height = '10%';
    });
    
    console.log('✅ Visualizador desactivado');
}

// ========================================
// ACTUALIZAR ESTADO VISUAL
// ========================================
function updateUI(playing) {
    console.log('🔄 Actualizando UI - playing:', playing);
    
    isPlaying = playing;
    
    if (playing) {
        // ESTADO: REPRODUCIENDO
        miniPlayButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="25" height="25">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
        `;
        miniPlayButton.classList.add('playing');
        
        // Activar visualizador
        activateVisualizer();
        
        // Mostrar indicador EN VIVO
        if (liveIndicator) {
            liveIndicator.style.display = 'flex';
        }
        
        console.log('✅ UI actualizada - REPRODUCIENDO');
        
    } else {
        // ESTADO: PAUSADO
        miniPlayButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="25" height="25">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;
        miniPlayButton.classList.remove('playing');
        
        // Desactivar visualizador
        deactivateVisualizer();
        
        // Ocultar indicador EN VIVO
        if (liveIndicator) {
            liveIndicator.style.display = 'none';
        }
        
        console.log('✅ UI actualizada - PAUSADO');
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

// Click en botón de play
if (miniPlayButton) {
    miniPlayButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🖱️ Click en botón de play detectado');
        togglePlayStop();
    });
    console.log('✅ Event listener del botón configurado');
} else {
    console.error('❌ No se encontró el botón de play');
}

// ========================================
// CONTROL DE VOLUMEN FLOTANTE
// ========================================

const volumeToggleBtn = document.getElementById('volume-toggle-btn');
const volumeSliderContainer = document.getElementById('volume-slider-container');
const volumePercentage = document.getElementById('volume-percentage');

let isVolumeVisible = false;

// Función para actualizar el ícono de volumen
function updateVolumeIcon(volume) {
    if (!volumeToggleBtn) return;
    
    const svg = volumeToggleBtn.querySelector('svg');
    if (!svg) return;
    
    let iconPath = '';
    
    if (volume === 0) {
        // Mudo
        iconPath = 'M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16 12c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1z';
    } else if (volume < 0.5) {
        // Volumen bajo
        iconPath = 'M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z';
    } else {
        // Volumen alto
        iconPath = 'M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z';
    }
    
    svg.querySelector('path').setAttribute('d', iconPath);
}

// Control de volumen
if (miniVolumeSlider) {
    miniVolumeSlider.addEventListener('input', function() {
        if (audio) {
            audio.volume = this.value;
            const percentage = Math.round(this.value * 100);
            if (volumePercentage) {
                volumePercentage.textContent = `${percentage}%`;
            }
            
            // Actualizar ícono según el volumen
            updateVolumeIcon(this.value);
            
            console.log('🔊 Volumen:', this.value, `(${percentage}%)`);
        }
    });
    
    // Inicializar ícono
    updateVolumeIcon(miniVolumeSlider.value);
    
    console.log('✅ Control de volumen configurado');
} else {
    console.log('⚠️ Control de volumen no encontrado');
}

// Toggle del botón de volumen
if (volumeToggleBtn && volumeSliderContainer) {
    volumeToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🎛️ Toggle volumen - isVisible:', isVolumeVisible);
        
        if (isVolumeVisible) {
            // Ocultar
            volumeSliderContainer.classList.remove('visible');
            isVolumeVisible = false;
            console.log('📉 Volumen ocultado');
        } else {
            // Mostrar
            volumeSliderContainer.classList.add('visible');
            isVolumeVisible = true;
            console.log('📈 Volumen mostrado');
        }
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (isVolumeVisible && 
            !volumeToggleBtn.contains(e.target) && 
            !volumeSliderContainer.contains(e.target)) {
            volumeSliderContainer.classList.remove('visible');
            isVolumeVisible = false;
            console.log('📉 Volumen ocultado (click fuera)');
        }
    });
    
    // Inicializar porcentaje
    if (volumePercentage && miniVolumeSlider) {
        const initialPercentage = Math.round(miniVolumeSlider.value * 100);
        volumePercentage.textContent = `${initialPercentage}%`;
    }
    
    console.log('✅ Control de volumen flotante configurado');
} else {
    console.log('⚠️ Elementos del control flotante no encontrados');
}

// Audio events
if (audio) {
    audio.addEventListener('play', () => {
        console.log('🎵 Audio PLAY event');
        updateUI(true);
    });
    
    audio.addEventListener('pause', () => {
        console.log('⏸️ Audio PAUSE event');
        updateUI(false);
    });
    
    audio.addEventListener('error', (e) => {
        console.error('❌ Audio ERROR:', e.type, e.message);
        updateUI(false);
    });
    
    audio.addEventListener('canplay', () => {
        console.log('✅ Audio CAN PLAY');
    });
    
    audio.addEventListener('loadstart', () => {
        console.log('📥 Audio LOAD START');
    });
    
    audio.addEventListener('waiting', () => {
        console.log('⏳ Audio WAITING for data');
    });
    
    audio.addEventListener('playing', () => {
        console.log('▶️ Audio PLAYING (really playing)');
    });
    
    console.log('✅ Event listeners del audio configurados');
} else {
    console.error('❌ CRÍTICO: No se encontró el elemento de audio');
}

// ========================================
// INICIALIZACIÓN
// ========================================
function initPlayer() {
    console.log('🔧 Inicializando reproductor...');
    
    // Verificar elementos críticos
    if (!audio) {
        console.error('❌ FATAL: No se puede inicializar sin elemento de audio');
        return;
    }
    
    if (!miniPlayButton) {
        console.error('❌ FATAL: No se puede inicializar sin botón de play');
        return;
    }
    
    // Cargar tema guardado
    console.log('🎨 Cargando tema...');
    loadTheme();
    
    // Estado inicial
    updateUI(false);
    
    // Inicializar metadata por defecto
    console.log('📄 Configurando metadata inicial...');
    updateMetadata('Cargando título...', 'Cargando artista...', 'portada.jpg');
    
    // Iniciar conexión de metadata
    console.log('📡 Iniciando sistema de metadata...');
    startMetadataUpdates();
    
    // Test inmediato del visualizador
    console.log('🧪 Probando visualizador inmediatamente...');
    activateVisualizer();
    
    setTimeout(() => {
        deactivateVisualizer();
        console.log('✅ Test del visualizador completado');
    }, 2000);
    
    // Intentar autoplay después de un momento
    setTimeout(() => {
        console.log('🚀 Intentando autoplay...');
        
        audio.play()
            .then(() => {
                console.log('✅ Autoplay exitoso');
            })
            .catch(error => {
                console.log('⚠️ Autoplay bloqueado (normal):', error.message);
            });
    }, 3000);
    
    console.log('✅ Reproductor inicializado');
}

// Función de inicialización más segura
function safeInit() {
    console.log('📋 Estado del documento:', document.readyState);
    
    // Esperar a que todos los elementos estén cargados
    if (document.readyState === 'complete') {
        initPlayer();
    } else {
        console.log('⏳ Esperando a que el documento se complete...');
        window.addEventListener('load', initPlayer);
    }
}

// Cargar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
} else {
    safeInit();
}

// ========================================
// FUNCIONES PARA REDES SOCIALES
// ========================================

// Función para detectar si está en móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Función para Facebook
function openFacebook() {
    console.log('📱 Abriendo Facebook...');
    if (isMobile()) {
        // Intenta abrir la app de Facebook primero
        window.location.href = 'fb://page/100063541459262';
        // Fallback a la web después de un timeout
        setTimeout(() => {
            window.open('https://www.facebook.com/profile.php?id=100063541459262', '_blank');
        }, 1000);
    } else {
        // En desktop, abre la web directamente
        window.open('https://www.facebook.com/profile.php?id=100063541459262', '_blank');
    }
}

// Función para Instagram
function openInstagram() {
    console.log('📱 Abriendo Instagram...');
    if (isMobile()) {
        // Intenta abrir la app de Instagram primero
        window.location.href = 'instagram://user?username=tucu.gram';
        // Fallback a la web después de un timeout
        setTimeout(() => {
            window.open('https://www.instagram.com/tucu.gram/', '_blank');
        }, 1000);
    } else {
        // En desktop, abre la web directamente
        window.open('https://www.instagram.com/tucu.gram/', '_blank');
    }
}

// Función para Twitter
function openTwitter() {
    console.log('📱 Abriendo Twitter...');
    if (isMobile()) {
        // Intenta abrir la app de Twitter primero
        window.location.href = 'twitter://user?screen_name=tucudev';
        // Fallback a la web después de un timeout
        setTimeout(() => {
            window.open('https://twitter.com/tucudev', '_blank');
        }, 1000);
    } else {
        // En desktop, abre la web directamente
        window.open('https://twitter.com/tucudev', '_blank');
    }
}

// Función para Gmail
function openGmail() {
    console.log('📱 Abriendo Gmail...');
    if (isMobile()) {
        // En móvil, usa mailto para abrir la app de correo predeterminada
        window.location.href = 'mailto:?subject=Reproductor Radio&body=¡Escucha nuestra radio en vivo!';
    } else {
        // En desktop, abre Gmail web
        window.open('https://mail.google.com/', '_blank');
    }
}

console.log('📝 Script ultra simple cargado completamente');
