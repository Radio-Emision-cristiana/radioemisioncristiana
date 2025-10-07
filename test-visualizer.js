// Script de prueba para el visualizador
console.log('=== Test del Visualizador ===');

// Esperar que la página se cargue
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('Ejecutando pruebas...');
    
    // Verificar elementos DOM
    const bars = document.querySelectorAll('.mini-equalizer-bar');
    console.log(`✓ Barras encontradas: ${bars.length}`);
    
    const audio = document.getElementById('audio-player');
    console.log(`✓ Elemento audio: ${audio ? 'Encontrado' : 'No encontrado'}`);
    
    const miniPlayer = document.querySelector('.mini-equalizer-container');
    console.log(`✓ Contenedor mini: ${miniPlayer ? 'Encontrado' : 'No encontrado'}`);
    
    // Verificar Audio Context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    console.log(`✓ AudioContext disponible: ${AudioContextClass ? 'Sí' : 'No'}`);
    
    // Verificar si el audio está reproduciéndose
    console.log(`✓ Audio pausado: ${audio ? audio.paused : 'N/A'}`);
    console.log(`✓ Audio source: ${audio ? audio.src : 'N/A'}`);
    
    // Probar animación fallback
    if (bars.length > 0) {
      console.log('⚡ Probando animación fallback...');
      bars.forEach((bar, index) => {
        bar.style.animation = `fallbackEqualize ${0.8 + (index % 5) * 0.3}s ease-in-out infinite`;
        bar.style.animationDelay = `${(index * 0.05)}s`;
      });
      
      setTimeout(() => {
        console.log('✓ Animación fallback aplicada');
      }, 100);
    }
    
  }, 2000);
});
