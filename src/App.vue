<script setup>
import { computed, onMounted, ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AttendanceManager from "./components/AttendanceManager.vue";
import DashboardView from "./components/DashboardView.vue";
import IncidenceProcessor from "./components/IncidenceProcessor.vue";
import ProjectManager from "./components/ProjectManager.vue";
import StudentManager from "./components/StudentManager.vue";
import { getResource } from "./services/api";

const views = [
  { id: "dashboard", label: "Resumen" },
  { id: "students", label: "Alumnos" },
  { id: "projects", label: "Proyectos" },
  { id: "attendance", label: "Asistencia" },
  { id: "incidences", label: "Incidencias" }
];

const initialView = views.some((view) => view.id === window.location.hash.replace("#", ""))
  ? window.location.hash.replace("#", "")
  : "dashboard";

const activeView = ref(initialView);
const loadingStats = ref(true);
const stats = ref({
  alumnos: 0,
  proyectos: 0,
  asistencias: 0,
  incidencias: 0
});

const currentTitle = computed(
  () => views.find((view) => view.id === activeView.value)?.label || "Resumen"
);

async function loadStats() {
  loadingStats.value = true;

  try {
    const [alumnos, proyectos, asistencias, incidencias] = await Promise.all([
      getResource("alumnos"),
      getResource("proyectos"),
      getResource("asistencias"),
      getResource("incidencias")
    ]);

    stats.value = {
      alumnos: alumnos.length,
      proyectos: proyectos.length,
      asistencias: asistencias.length,
      incidencias: incidencias.length
    };
  } finally {
    loadingStats.value = false;
  }
}

function navigate(viewId) {
  activeView.value = viewId;
  window.location.hash = viewId;
}

async function handleDataChanged() {
  await loadStats();
}

onMounted(() => {
  window.addEventListener("hashchange", () => {
    const hashView = window.location.hash.replace("#", "");

    if (views.some((view) => view.id === hashView)) {
      activeView.value = hashView;
    }
  });

  loadStats();
});
</script>

<template>
  <AppHeader :active-view="activeView" :views="views" @navigate="navigate" />

  <main class="app-shell">
    <div class="view-heading">
      <p>Proyecto final CRUD mediante API</p>
      <h1>{{ currentTitle }}</h1>
    </div>

    <DashboardView
      v-if="activeView === 'dashboard'"
      :loading="loadingStats"
      :stats="stats"
      @navigate="navigate"
    />
    <StudentManager v-else-if="activeView === 'students'" @changed="handleDataChanged" />
    <ProjectManager v-else-if="activeView === 'projects'" @changed="handleDataChanged" />
    <AttendanceManager v-else-if="activeView === 'attendance'" @changed="handleDataChanged" />
    <IncidenceProcessor v-else @changed="handleDataChanged" />
  </main>
</template>
