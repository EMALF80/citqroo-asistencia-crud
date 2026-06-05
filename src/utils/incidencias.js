const dayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado"
];

function getDayName(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return dayNames[date.getDay()];
}

function timeToMinutes(value) {
  if (!value) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function findType(tiposIncidencia, name) {
  return tiposIncidencia.find((tipo) => tipo.nombre === name)?.id;
}

function createIncident({ fecha, alumnoId, tipoIncidenciaId, horaEntrada = "", horaSalida = "", observacion }) {
  return {
    fecha,
    alumnoId,
    tipoIncidenciaId,
    horaEntrada,
    horaSalida,
    observacion
  };
}

export function buildIncidences({ fecha, alumnos, horarios, asistencias, tiposIncidencia }) {
  const dayName = getDayName(fecha);
  const todayRecords = asistencias.filter((registro) => registro.fecha === fecha);
  const todaySchedules = horarios.filter((horario) => horario.diaSemana === dayName);

  const incidents = [];
  const typeIds = {
    late: findType(tiposIncidencia, "Retardo"),
    early: findType(tiposIncidencia, "Salida anticipada"),
    absence: findType(tiposIncidencia, "Falta"),
    offSchedule: findType(tiposIncidencia, "Fuera de horario")
  };

  alumnos.forEach((alumno) => {
    const schedule = todaySchedules.find((horario) => Number(horario.alumnoId) === Number(alumno.id));
    const records = todayRecords.filter((registro) => Number(registro.alumnoId) === Number(alumno.id));

    if (!schedule && records.length > 0) {
      records.forEach((registro) => {
        incidents.push(
          createIncident({
            fecha,
            alumnoId: alumno.id,
            tipoIncidenciaId: typeIds.offSchedule,
            horaEntrada: registro.tipoRegistro === "Entrada" ? registro.hora : "",
            horaSalida: registro.tipoRegistro === "Salida" ? registro.hora : "",
            observacion: "Registro capturado sin horario programado para el dia."
          })
        );
      });
      return;
    }

    if (!schedule) {
      return;
    }

    const entryRecord = records.find((registro) => registro.tipoRegistro === "Entrada");
    const exitRecord = records.find((registro) => registro.tipoRegistro === "Salida");
    const entryLimit = timeToMinutes(schedule.entrada1);
    const exitLimit = timeToMinutes(schedule.salida1);

    if (!entryRecord && !exitRecord) {
      incidents.push(
        createIncident({
          fecha,
          alumnoId: alumno.id,
          tipoIncidenciaId: typeIds.absence,
          observacion: "No se registro entrada ni salida."
        })
      );
      return;
    }

    if (!entryRecord) {
      incidents.push(
        createIncident({
          fecha,
          alumnoId: alumno.id,
          tipoIncidenciaId: typeIds.absence,
          horaSalida: exitRecord?.hora || "",
          observacion: "No se registro entrada."
        })
      );
    } else {
      const delay = timeToMinutes(entryRecord.hora) - entryLimit;

      if (delay > 20) {
        incidents.push(
          createIncident({
            fecha,
            alumnoId: alumno.id,
            tipoIncidenciaId: typeIds.absence,
            horaEntrada: entryRecord.hora,
            observacion: "Entrada posterior a 20 minutos."
          })
        );
      } else if (delay > 10) {
        incidents.push(
          createIncident({
            fecha,
            alumnoId: alumno.id,
            tipoIncidenciaId: typeIds.late,
            horaEntrada: entryRecord.hora,
            observacion: "Entrada posterior a 10 minutos."
          })
        );
      }
    }

    if (!exitRecord) {
      incidents.push(
        createIncident({
          fecha,
          alumnoId: alumno.id,
          tipoIncidenciaId: typeIds.absence,
          horaEntrada: entryRecord?.hora || "",
          observacion: "No se registro salida."
        })
      );
    } else {
      const earlyDeparture = exitLimit - timeToMinutes(exitRecord.hora);

      if (earlyDeparture > 15) {
        incidents.push(
          createIncident({
            fecha,
            alumnoId: alumno.id,
            tipoIncidenciaId: typeIds.absence,
            horaSalida: exitRecord.hora,
            observacion: "Salida antes de 15 minutos del horario programado."
          })
        );
      } else if (earlyDeparture > 5) {
        incidents.push(
          createIncident({
            fecha,
            alumnoId: alumno.id,
            tipoIncidenciaId: typeIds.early,
            horaSalida: exitRecord.hora,
            observacion: "Salida antes de 5 minutos del horario programado."
          })
        );
      }
    }
  });

  return incidents;
}

