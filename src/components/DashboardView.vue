<script setup>
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  stats: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["navigate"]);

const summaryCards = [
  { key: "alumnos", label: "Alumnos activos", accent: "blue" },
  { key: "proyectos", label: "Proyectos", accent: "green" },
  { key: "asistencias", label: "Registros", accent: "amber" },
  { key: "incidencias", label: "Incidencias", accent: "red" }
];

const flowSteps = [
  "Registrar alumnos con carrera y semestre.",
  "Administrar proyectos y docente responsable.",
  "Capturar entradas y salidas diarias.",
  "Procesar incidencias segun horarios programados."
];
</script>

<template>
  <section class="dashboard-grid">
    <article
      v-for="card in summaryCards"
      :key="card.key"
      class="stat-card"
      :class="card.accent"
    >
      <span>{{ card.label }}</span>
      <strong v-if="!props.loading">{{ props.stats[card.key] }}</strong>
      <strong v-else>...</strong>
    </article>
  </section>

  <section class="content-panel process-panel">
    <div>
      <p class="section-kicker">Flujo del proceso</p>
      <h2>Control de asistencia e incidencias</h2>
    </div>

    <ol class="process-list">
      <li v-for="step in flowSteps" :key="step">{{ step }}</li>
    </ol>

    <div class="quick-actions">
      <button type="button" class="primary" @click="emit('navigate', 'students')">
        Gestionar alumnos
      </button>
      <button type="button" @click="emit('navigate', 'attendance')">
        Registrar asistencia
      </button>
      <button type="button" @click="emit('navigate', 'incidences')">
        Procesar incidencias
      </button>
    </div>
  </section>
</template>

