# Control de Asistencia CITQROO

Proyecto final de la materia Framework Frontend: app CRUD desarrollada con Vue.js que consume una API fake creada con `json-server`.

## Proceso elegido

Control de asistencia y participacion de alumnos en el Centro de Innovacion del CITQROO.

La aplicacion permite administrar:

- Alumnos
- Proyectos
- Registros de asistencia
- Incidencias generadas a partir de horarios

Tambien consume catalogos de carreras, docentes, tipos de participacion y tipos de incidencia.

## Requisitos cubiertos

- Consumo de API interna con `json-server`.
- Uso de mas de 3 tablas/entidades.
- Operaciones CRUD mediante formularios y `fetch`.
- Componentes Vue que reciben datos con `props` y devuelven eventos con `emit`.
- Uso de binding con `v-model` y `:prop`.
- Uso de directivas `v-for`, `v-if`, `v-else-if` y `v-else`.
- Uso de `onMounted`, metodos y propiedades `computed`.

## Instalacion

```bash
npm install
```

## Ejecutar API

```bash
npm run api
```

La API queda disponible en:

```text
http://localhost:3001
```

## Ejecutar aplicacion Vue

En otra terminal:

```bash
npm run dev
```

La aplicacion queda disponible normalmente en:

```text
http://127.0.0.1:5173
```

## Compilar

```bash
npm run build
```

## Documento de entrega

El documento con capturas del proceso se encuentra en:

```text
docs/Entrega_Proyecto_Final_CITQROO.docx
```
