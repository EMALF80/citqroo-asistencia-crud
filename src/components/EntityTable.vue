<script setup>
defineProps({
  columns: {
    type: Array,
    required: true
  },
  rows: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: "No hay registros para mostrar."
  }
});

const emit = defineEmits(["edit", "delete"]);

function getCell(row, column) {
  if (typeof column.value === "function") {
    return column.value(row);
  }

  return row[column.key] || "Sin dato";
}
</script>

<template>
  <div class="table-wrap">
    <p v-if="loading" class="muted-state">Cargando registros...</p>

    <table v-else-if="rows.length > 0">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
          <th class="actions-column">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td v-for="column in columns" :key="column.key">
            {{ getCell(row, column) }}
          </td>
          <td class="row-actions">
            <button type="button" @click="emit('edit', row)">Editar</button>
            <button type="button" class="danger" @click="emit('delete', row)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else class="muted-state">{{ emptyMessage }}</p>
  </div>
</template>

