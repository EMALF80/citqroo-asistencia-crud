<script setup>
defineProps({
  activeView: {
    type: String,
    required: true
  },
  views: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(["navigate"]);
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <span class="brand-mark">CI</span>
      <div>
        <strong>Control de Asistencia</strong>
        <small>CITQROO</small>
      </div>
    </div>

    <nav class="nav-tabs" aria-label="Navegacion principal">
      <button
        v-for="view in views"
        :key="view.id"
        type="button"
        :class="{ active: activeView === view.id }"
        @click="emit('navigate', view.id)"
      >
        {{ view.label }}
      </button>
    </nav>
  </header>
</template>

