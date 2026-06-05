<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import EntityTable from "./EntityTable.vue";
import { createResource, deleteResource, getResource, updateResource } from "../services/api";

const emit = defineEmits(["changed"]);

const emptyForm = {
  nombre: "",
  descripcion: "",
  fechaInicio: "",
  fechaTermino: "",
  docenteId: ""
};

const proyectos = ref([]);
const docentes = ref([]);
const loading = ref(true);
const editingId = ref(null);
const message = ref("");
const form = reactive({ ...emptyForm });

const columns = [
  { key: "nombre", label: "Proyecto" },
  { key: "docenteNombre", label: "Docente responsable" },
  { key: "fechaInicio", label: "Inicio" },
  { key: "fechaTermino", label: "Termino" }
];

const tableRows = computed(() =>
  proyectos.value.map((proyecto) => ({
    ...proyecto,
    docenteNombre:
      docentes.value.find((docente) => Number(docente.id) === Number(proyecto.docenteId))
        ?.nombreCompleto || "Sin docente",
    fechaTermino: proyecto.fechaTermino || "En proceso"
  }))
);

const formTitle = computed(() =>
  editingId.value ? "Editar proyecto" : "Registrar proyecto"
);

async function loadData() {
  loading.value = true;
  [proyectos.value, docentes.value] = await Promise.all([
    getResource("proyectos"),
    getResource("docentes")
  ]);
  loading.value = false;
}

function resetForm() {
  Object.assign(form, emptyForm);
  editingId.value = null;
}

async function submitForm() {
  const payload = {
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    fechaInicio: form.fechaInicio,
    fechaTermino: form.fechaTermino,
    docenteId: Number(form.docenteId)
  };

  if (editingId.value) {
    await updateResource("proyectos", editingId.value, { ...payload, id: editingId.value });
    message.value = "Proyecto actualizado correctamente.";
  } else {
    await createResource("proyectos", payload);
    message.value = "Proyecto registrado correctamente.";
  }

  resetForm();
  await loadData();
  emit("changed");
}

function editRow(row) {
  editingId.value = row.id;
  Object.assign(form, {
    nombre: row.nombre,
    descripcion: row.descripcion,
    fechaInicio: row.fechaInicio,
    fechaTermino: row.fechaTermino === "En proceso" ? "" : row.fechaTermino,
    docenteId: row.docenteId
  });
}

async function deleteRow(row) {
  await deleteResource("proyectos", row.id);
  message.value = "Proyecto eliminado correctamente.";
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
        Nombre del proyecto
        <input v-model="form.nombre" type="text" required />
      </label>

      <label>
        Descripcion
        <textarea v-model="form.descripcion" rows="4" required></textarea>
      </label>

      <label>
        Fecha de inicio
        <input v-model="form.fechaInicio" type="date" required />
      </label>

      <label>
        Fecha de termino
        <input v-model="form.fechaTermino" type="date" />
      </label>

      <label>
        Docente responsable
        <select v-model="form.docenteId" required>
          <option value="">Seleccione un docente</option>
          <option v-for="docente in docentes" :key="docente.id" :value="docente.id">
            {{ docente.nombreCompleto }}
          </option>
        </select>
      </label>

      <div class="form-actions">
        <button type="submit" class="primary">
          {{ editingId ? "Guardar cambios" : "Agregar proyecto" }}
        </button>
        <button v-if="editingId" type="button" @click="resetForm">Cancelar</button>
      </div>

      <p v-if="message" class="success-message">{{ message }}</p>
    </form>

    <section class="content-panel list-panel">
      <div class="panel-heading">
        <div>
          <p class="section-kicker">Tabla proyectos</p>
          <h2>Proyectos registrados</h2>
        </div>
        <span>{{ tableRows.length }} registros</span>
      </div>

      <EntityTable
        :columns="columns"
        :rows="tableRows"
        :loading="loading"
        empty-message="No hay proyectos registrados."
        @edit="editRow"
        @delete="deleteRow"
      />
    </section>
  </section>
</template>

