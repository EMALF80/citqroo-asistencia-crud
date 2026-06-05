<script setup>
import { computed, onMounted, ref } from "vue";
import EntityTable from "./EntityTable.vue";
import { createResource, deleteResource, getResource } from "../services/api";
import { buildIncidences } from "../utils/incidencias";

const emit = defineEmits(["changed"]);

function today() {
  return new Date().toISOString().slice(0, 10);
}

const fecha = ref(today());
const alumnos = ref([]);
const horarios = ref([]);
const asistencias = ref([]);
const tiposIncidencia = ref([]);
const incidencias = ref([]);
const loading = ref(true);
const processing = ref(false);
const message = ref("");

const columns = [
  { key: "fecha", label: "Fecha" },
  { key: "alumnoNombre", label: "Alumno" },
  { key: "tipoNombre", label: "Incidencia" },
  { key: "horaEntrada", label: "Entrada" },
  { key: "horaSalida", label: "Salida" },
  { key: "observacion", label: "Observacion" }
];

const filteredIncidences = computed(() =>
  incidencias.value
    .filter((incidencia) => incidencia.fecha === fecha.value)
    .map((incidencia) => ({
      ...incidencia,
      alumnoNombre:
        alumnos.value.find((alumno) => Number(alumno.id) === Number(incidencia.alumnoId))
          ?.nombreCompleto || "Sin alumno",
      tipoNombre:
        tiposIncidencia.value.find(
          (tipo) => Number(tipo.id) === Number(incidencia.tipoIncidenciaId)
        )?.nombre || "Sin tipo",
      horaEntrada: incidencia.horaEntrada || "-",
      horaSalida: incidencia.horaSalida || "-"
    }))
);

async function loadData() {
  loading.value = true;
  [alumnos.value, horarios.value, asistencias.value, tiposIncidencia.value, incidencias.value] =
    await Promise.all([
      getResource("alumnos"),
      getResource("horarios"),
      getResource("asistencias"),
      getResource("tiposIncidencia"),
      getResource("incidencias")
    ]);
  loading.value = false;
}

async function processIncidences() {
  processing.value = true;
  message.value = "";

  const previous = incidencias.value.filter((incidencia) => incidencia.fecha === fecha.value);
  await Promise.all(previous.map((incidencia) => deleteResource("incidencias", incidencia.id)));

  const generated = buildIncidences({
    fecha: fecha.value,
    alumnos: alumnos.value,
    horarios: horarios.value,
    asistencias: asistencias.value,
    tiposIncidencia: tiposIncidencia.value
  });

  await Promise.all(generated.map((incidencia) => createResource("incidencias", incidencia)));
  await loadData();
  emit("changed");

  message.value =
    generated.length > 0
      ? `Proceso completado. Se generaron ${generated.length} incidencias.`
      : "Proceso completado. No se generaron incidencias.";
  processing.value = false;
}

async function deleteRow(row) {
  await deleteResource("incidencias", row.id);
  message.value = "Incidencia eliminada.";
  await loadData();
  emit("changed");
}

function editRow() {
  message.value = "Las incidencias se recalculan desde el proceso diario.";
}

onMounted(loadData);
</script>

<template>
  <section class="content-panel processor-panel">
    <div class="panel-heading">
      <div>
        <p class="section-kicker">Proceso automatico</p>
        <h2>Generacion de incidencias</h2>
      </div>
      <span>{{ filteredIncidences.length }} incidencias del dia</span>
    </div>

    <div class="processor-toolbar">
      <label>
        Fecha a procesar
        <input v-model="fecha" type="date" @change="loadData" />
      </label>

      <button type="button" class="primary" :disabled="processing" @click="processIncidences">
        {{ processing ? "Procesando..." : "Procesar dia" }}
      </button>
    </div>

    <p class="helper-text">
      El proceso compara asistencia y horarios para clasificar retardo, salida anticipada,
      falta o fuera de horario.
    </p>

    <p v-if="message" class="success-message">{{ message }}</p>

    <EntityTable
      :columns="columns"
      :rows="filteredIncidences"
      :loading="loading"
      empty-message="Aun no hay incidencias para la fecha seleccionada."
      @edit="editRow"
      @delete="deleteRow"
    />
  </section>
</template>

