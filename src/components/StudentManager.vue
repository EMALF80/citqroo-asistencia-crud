<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import EntityTable from "./EntityTable.vue";
import { createResource, deleteResource, getResource, updateResource } from "../services/api";

const emit = defineEmits(["changed"]);

const emptyForm = {
  nombreCompleto: "",
  numeroControl: "",
  carreraId: "",
  semestre: ""
};

const alumnos = ref([]);
const carreras = ref([]);
const loading = ref(true);
const editingId = ref(null);
const message = ref("");
const form = reactive({ ...emptyForm });

const columns = [
  { key: "nombreCompleto", label: "Alumno" },
  { key: "numeroControl", label: "No. control" },
  { key: "carreraNombre", label: "Carrera" },
  { key: "semestre", label: "Semestre" }
];

const tableRows = computed(() =>
  alumnos.value.map((alumno) => ({
    ...alumno,
    carreraNombre:
      carreras.value.find((carrera) => Number(carrera.id) === Number(alumno.carreraId))?.nombre ||
      "Sin carrera"
  }))
);

const formTitle = computed(() =>
  editingId.value ? "Editar alumno" : "Registrar alumno"
);

async function loadData() {
  loading.value = true;
  [alumnos.value, carreras.value] = await Promise.all([
    getResource("alumnos"),
    getResource("carreras")
  ]);
  loading.value = false;
}

function resetForm() {
  Object.assign(form, emptyForm);
  editingId.value = null;
}

async function submitForm() {
  const payload = {
    nombreCompleto: form.nombreCompleto.trim(),
    numeroControl: form.numeroControl.trim(),
    carreraId: Number(form.carreraId),
    semestre: Number(form.semestre)
  };

  if (editingId.value) {
    await updateResource("alumnos", editingId.value, { ...payload, id: editingId.value });
    message.value = "Alumno actualizado correctamente.";
  } else {
    await createResource("alumnos", payload);
    message.value = "Alumno registrado correctamente.";
  }

  resetForm();
  await loadData();
  emit("changed");
}

function editRow(row) {
  editingId.value = row.id;
  Object.assign(form, {
    nombreCompleto: row.nombreCompleto,
    numeroControl: row.numeroControl,
    carreraId: row.carreraId,
    semestre: row.semestre
  });
}

async function deleteRow(row) {
  await deleteResource("alumnos", row.id);
  message.value = "Alumno eliminado correctamente.";
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
        Nombre completo
        <input v-model="form.nombreCompleto" type="text" required />
      </label>

      <label>
        Numero de control
        <input v-model="form.numeroControl" type="text" required />
      </label>

      <label>
        Carrera
        <select v-model="form.carreraId" required>
          <option value="">Seleccione una carrera</option>
          <option v-for="carrera in carreras" :key="carrera.id" :value="carrera.id">
            {{ carrera.nombre }}
          </option>
        </select>
      </label>

      <label>
        Semestre
        <input v-model="form.semestre" type="number" min="1" max="12" required />
      </label>

      <div class="form-actions">
        <button type="submit" class="primary">
          {{ editingId ? "Guardar cambios" : "Agregar alumno" }}
        </button>
        <button v-if="editingId" type="button" @click="resetForm">Cancelar</button>
      </div>

      <p v-if="message" class="success-message">{{ message }}</p>
    </form>

    <section class="content-panel list-panel">
      <div class="panel-heading">
        <div>
          <p class="section-kicker">Tabla alumnos</p>
          <h2>Registros actuales</h2>
        </div>
        <span>{{ tableRows.length }} registros</span>
      </div>

      <EntityTable
        :columns="columns"
        :rows="tableRows"
        :loading="loading"
        empty-message="No hay alumnos registrados."
        @edit="editRow"
        @delete="deleteRow"
      />
    </section>
  </section>
</template>

