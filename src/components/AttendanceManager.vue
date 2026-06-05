<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import EntityTable from "./EntityTable.vue";
import { createResource, deleteResource, getResource, updateResource } from "../services/api";

const emit = defineEmits(["changed"]);

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = {
  fecha: today(),
  hora: "",
  alumnoId: "",
  tipoRegistro: "Entrada"
};

const asistencias = ref([]);
const alumnos = ref([]);
const loading = ref(true);
const editingId = ref(null);
const message = ref("");
const form = reactive({ ...emptyForm });

const columns = [
  { key: "fecha", label: "Fecha" },
  { key: "hora", label: "Hora" },
  { key: "alumnoNombre", label: "Alumno" },
  { key: "tipoRegistro", label: "Tipo" }
];

const tableRows = computed(() =>
  [...asistencias.value]
    .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`))
    .map((registro) => ({
      ...registro,
      alumnoNombre:
        alumnos.value.find((alumno) => Number(alumno.id) === Number(registro.alumnoId))
          ?.nombreCompleto || "Sin alumno"
    }))
);

const formTitle = computed(() =>
  editingId.value ? "Editar registro" : "Registrar asistencia"
);

async function loadData() {
  loading.value = true;
  [asistencias.value, alumnos.value] = await Promise.all([
    getResource("asistencias"),
    getResource("alumnos")
  ]);
  loading.value = false;
}

function resetForm() {
  Object.assign(form, emptyForm);
  editingId.value = null;
}

async function submitForm() {
  const payload = {
    fecha: form.fecha,
    hora: form.hora,
    alumnoId: Number(form.alumnoId),
    tipoRegistro: form.tipoRegistro
  };

  if (editingId.value) {
    await updateResource("asistencias", editingId.value, { ...payload, id: editingId.value });
    message.value = "Registro de asistencia actualizado.";
  } else {
    await createResource("asistencias", payload);
    message.value = "Registro de asistencia capturado.";
  }

  resetForm();
  await loadData();
  emit("changed");
}

function editRow(row) {
  editingId.value = row.id;
  Object.assign(form, {
    fecha: row.fecha,
    hora: row.hora,
    alumnoId: row.alumnoId,
    tipoRegistro: row.tipoRegistro
  });
}

async function deleteRow(row) {
  await deleteResource("asistencias", row.id);
  message.value = "Registro de asistencia eliminado.";
  await loadData();
  emit("changed");
}

onMounted(loadData);
</script>

<template>
  <section class="workspace-grid">
    <form class="content-panel form-panel" @submit.prevent="submitForm">
      <p class="section-kicker">CRUD</p>
      <h2>{{ formTitle }}</h2>

      <label>
        Fecha
        <input v-model="form.fecha" type="date" required />
      </label>

      <label>
        Hora
        <input v-model="form.hora" type="time" required />
      </label>

      <label>
        Alumno
        <select v-model="form.alumnoId" required>
          <option value="">Seleccione un alumno</option>
          <option v-for="alumno in alumnos" :key="alumno.id" :value="alumno.id">
            {{ alumno.nombreCompleto }}
          </option>
        </select>
      </label>

      <label>
        Tipo de registro
        <select v-model="form.tipoRegistro" required>
          <option value="Entrada">Entrada</option>
          <option value="Salida">Salida</option>
        </select>
      </label>

      <div class="form-actions">
        <button type="submit" class="primary">
          {{ editingId ? "Guardar cambios" : "Agregar registro" }}
        </button>
        <button v-if="editingId" type="button" @click="resetForm">Cancelar</button>
      </div>

      <p v-if="message" class="success-message">{{ message }}</p>
    </form>

    <section class="content-panel list-panel">
      <div class="panel-heading">
        <div>
          <p class="section-kicker">Tabla asistencia</p>
          <h2>Entradas y salidas</h2>
        </div>
        <span>{{ tableRows.length }} registros</span>
      </div>

      <EntityTable
        :columns="columns"
        :rows="tableRows"
        :loading="loading"
        empty-message="No hay registros de asistencia."
        @edit="editRow"
        @delete="deleteRow"
      />
    </section>
  </section>
</template>

