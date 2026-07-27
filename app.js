/**
 * Lógica principal para la rutina PPL
 */

// Estructura de datos para la rotación (1, 2, 3 son las semanas)
const schedule = {
  1: ['push', 'pull', 'legs', 'push', 'pull', 'rest', 'rest'],
  2: ['legs', 'push', 'pull', 'legs', 'push', 'rest', 'rest'],
  3: ['pull', 'legs', 'push', 'pull', 'legs', 'rest', 'rest']
};

// Días de la semana
const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Conteo de ejercicios por día
const exerciseCounts = {
  'push': 4,
  'pull': 5,
  'legs': 6
};

// Objeto para almacenar el progreso
let progress = {};

// Clave para localStorage
const STORAGE_KEY = 'ppl-routine-progress';

/**
 * Guarda el progreso en localStorage
 */
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Carga el progreso desde localStorage
 */
function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      progress = JSON.parse(saved);
    } catch (e) {
      progress = {};
    }
  } else {
    progress = {};
  }
}

/**
 * Cambia la pestaña activa (Push, Pull, Legs)
 * @param {string} day - 'push', 'pull', o 'legs'
 */
function setActiveTab(day) {
  // Ocultar todas las secciones y quitar .active
  ['push', 'pull', 'legs'].forEach(d => {
    const section = document.getElementById(`section-${d}`);
    const tab = document.getElementById(`tab-${d}`);
    
    if (section) {
      if (d === day) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    }
    
    if (tab) {
      if (d === day) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    }
  });

  // Actualizar la barra de progreso para el día activo
  updateProgress(day);
}

/**
 * Función global para ir a un día específico y hacer scroll
 * @param {string} day - 'push', 'pull', o 'legs'
 */
window.goToDay = function(day) {
  setActiveTab(day);
  const section = document.getElementById('exercises-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Calcula qué toca hoy según la semana seleccionada
 * @param {number|string} weekNum - 1, 2 o 3
 */
function calculateToday(weekNum) {
  const week = parseInt(weekNum);
  
  // Obtener el día actual (0 = Domingo, 1 = Lunes... 6 = Sábado)
  const today = new Date().getDay();
  
  // Mapear al índice de nuestro horario (Lunes = 0... Domingo = 6)
  const dayIndex = today === 0 ? 6 : today - 1;
  
  // Obtener lo que toca hoy de la estructura de rotación
  const currentActivity = schedule[week][dayIndex];
  
  // Actualizar la UI
  const resultEl = document.getElementById('today-result');
  if (!resultEl) return;
  
  // Limpiar clases de tipo
  resultEl.classList.remove('push', 'pull', 'legs', 'rest');
  
  // Añadir la clase actual y el mensaje
  if (currentActivity === 'push') {
    resultEl.classList.add('push');
    resultEl.innerHTML = `🔥 ¡Hoy toca <strong>PUSH DAY</strong>! Pecho, hombros y tríceps <br><button class="go-btn" onclick="goToDay('push')">Ir a Push Day →</button>`;
  } else if (currentActivity === 'pull') {
    resultEl.classList.add('pull');
    resultEl.innerHTML = `💪 ¡Hoy toca <strong>PULL DAY</strong>! Espalda y bíceps <br><button class="go-btn" onclick="goToDay('pull')">Ir a Pull Day →</button>`;
  } else if (currentActivity === 'legs') {
    resultEl.classList.add('legs');
    resultEl.innerHTML = `🦵 ¡Hoy toca <strong>LEG DAY</strong>! Piernas completas <br><button class="go-btn" onclick="goToDay('legs')">Ir a Leg Day →</button>`;
  } else {
    resultEl.classList.add('rest');
    resultEl.innerHTML = `😴 ¡Hoy es día de <strong>DESCANSO</strong>! Recupera y vuelve más fuerte`;
  }
  
  resultEl.classList.add('visible');
  
  // Actualizar botones de semana
  document.querySelectorAll('.week-btn').forEach(btn => {
    if (parseInt(btn.getAttribute('data-week')) === week) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Alterna el estado completado de un ejercicio
 * @param {string} exerciseId - ID del ejercicio (ej. 'push-1')
 */
function toggleExercise(exerciseId) {
  // Cambiar estado en el objeto de progreso
  progress[exerciseId] = !progress[exerciseId];
  
  // Obtener el botón
  const btn = document.querySelector(`.complete-btn[data-exercise="${exerciseId}"]`);
  if (!btn) return;
  
  // Obtener la tarjeta del ejercicio (ancestro más cercano)
  const card = btn.closest('.exercise-card');
  
  if (progress[exerciseId]) {
    btn.classList.add('completed');
    btn.textContent = '✓ Completado';
    if (card) card.classList.add('completed');
  } else {
    btn.classList.remove('completed');
    btn.textContent = 'Marcar completo';
    if (card) card.classList.remove('completed');
  }
  
  // Guardar en localStorage
  saveProgress();
  
  // Determinar qué día estamos viendo actualmente
  let activeDay = 'push';
  const pushTab = document.getElementById('tab-push');
  const pullTab = document.getElementById('tab-pull');
  const legsTab = document.getElementById('tab-legs');
  
  if (pullTab && pullTab.classList.contains('active')) activeDay = 'pull';
  if (legsTab && legsTab.classList.contains('active')) activeDay = 'legs';
  
  // Actualizar la barra de progreso
  updateProgress(activeDay);
}

/**
 * Actualiza la barra de progreso según el día activo
 * @param {string} day - 'push', 'pull', o 'legs'
 */
function updateProgress(day) {
  const total = exerciseCounts[day];
  let completed = 0;
  
  // Contar cuántos ejercicios de este día están completados
  for (let i = 1; i <= total; i++) {
    if (progress[`${day}-${i}`]) {
      completed++;
    }
  }
  
  // Calcular porcentaje
  const percentage = (completed / total) * 100;
  
  // Actualizar DOM
  const fillEl = document.getElementById('progress-fill');
  const countEl = document.getElementById('progress-count');
  const titleEl = document.getElementById('progress-title');
  
  if (fillEl) {
    fillEl.style.width = `${percentage}%`;
    fillEl.classList.remove('push', 'pull', 'legs');
    fillEl.classList.add(day);
  }
  
  if (countEl) {
    countEl.textContent = `${completed} / ${total} ejercicios completados`;
  }
  
  if (titleEl) {
    const titles = {
      'push': 'Push Day',
      'pull': 'Pull Day',
      'legs': 'Leg Day'
    };
    titleEl.textContent = titles[day] || day;
  }
}

/**
 * Calcula el número de semana ISO actual
 * @returns {number} Número de semana ISO
 */
function getISOWeekNumber() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
  // Cargar progreso de localStorage
  loadProgress();
  
  // Restaurar estado visual de los ejercicios completados
  Object.keys(progress).forEach(exerciseId => {
    if (progress[exerciseId]) {
      const btn = document.querySelector(`.complete-btn[data-exercise="${exerciseId}"]`);
      if (btn) {
        btn.classList.add('completed');
        btn.textContent = '✓ Completado';
        const card = btn.closest('.exercise-card');
        if (card) card.classList.add('completed');
      }
    }
  });
  
  // Configurar event listeners para las pestañas
  ['push', 'pull', 'legs'].forEach(day => {
    const tab = document.getElementById(`tab-${day}`);
    if (tab) {
      tab.addEventListener('click', () => setActiveTab(day));
    }
  });
  
  // Pestaña por defecto
  setActiveTab('push');
  
  // Configurar botones de semana
  document.querySelectorAll('.week-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const week = e.target.getAttribute('data-week');
      calculateToday(week);
    });
  });
  
  // Configurar botones de completar
  document.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const exerciseId = e.target.getAttribute('data-exercise');
      toggleExercise(exerciseId);
    });
  });
  
  // Configurar badges del calendario
  document.querySelectorAll('.day-badge').forEach(badge => {
    badge.addEventListener('click', (e) => {
      const dayType = e.target.closest('.day-badge').getAttribute('data-day');
      if (dayType && dayType !== 'rest') {
        window.goToDay(dayType);
      }
    });
  });
  
  // Configurar control de videos
  document.querySelectorAll('.video-container').forEach(container => {
    const video = container.querySelector('video');
    const overlay = container.querySelector('.video-overlay');
    
    if (video && overlay) {
      // Por defecto mutear y poner en loop
      video.muted = true;
      video.loop = true;
      
      overlay.addEventListener('click', () => {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
      
      video.addEventListener('play', () => {
        overlay.classList.add('hidden');
      });
      
      video.addEventListener('pause', () => {
        overlay.classList.remove('hidden');
      });
      
      video.addEventListener('ended', () => {
        overlay.classList.remove('hidden');
      });
    }
  });
  
  // Configurar botón de reinicio
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('¿Seguro que quieres reiniciar tu progreso de hoy?')) {
        progress = {};
        saveProgress();
        
        // Quitar clases y resetear texto
        document.querySelectorAll('.complete-btn').forEach(btn => {
          btn.classList.remove('completed');
          btn.textContent = 'Marcar completo';
        });
        
        document.querySelectorAll('.exercise-card').forEach(card => {
          card.classList.remove('completed');
        });
        
        // Actualizar barra de progreso para el día actual
        let activeDay = 'push';
        const pullTab = document.getElementById('tab-pull');
        const legsTab = document.getElementById('tab-legs');
        if (pullTab && pullTab.classList.contains('active')) activeDay = 'pull';
        if (legsTab && legsTab.classList.contains('active')) activeDay = 'legs';
        
        updateProgress(activeDay);
      }
    });
  }
  
  // Configurar animaciones de scroll
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
  });
  
  // Autodetectar semana
  const isoWeek = getISOWeekNumber();
  const currentWeek = (isoWeek % 3) + 1; // 1, 2, o 3
  calculateToday(currentWeek);
});
