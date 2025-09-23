export const ENDPOINTS = {
  auth: {
    login: "/auth/login" as const, // POST
    me: "/auth/me" as const
  },
  users: {
    list: "/users/" as const, // GET
    byId: (userId: number) => `/users/${userId}`, // GET, PUT, DELETE
    changePassword: (userId: number) => `/users/${userId}/change-password`, // PUT
    medicos: () => `/users/medicos`,
  },
  accountRequests: {
    list: "/account-requests/" as const,            // GET (solo admin)
    create: "/account-requests/" as const,          // POST (público)
    approve: (requestId: number) =>
      `/account-requests/${requestId}/approve` as const,      // POST (admin)
    createUser: (requestId: number) =>
      `/account-requests/${requestId}/create-user` as const,  // POST (admin)
  },
  pacientes: {
    /** GET /api/v1/pacientes/  |  POST /api/v1/pacientes/ */
    list: "/pacientes/" as const,
    create: "/pacientes/" as const,

    /** GET /api/v1/pacientes/buscar?nombre=..&dni=..&hce=..  (usa 1 o varios) */
    search: "/pacientes/buscar" as const,
    /** GET/PUT/DELETE /api/v1/pacientes/{paciente_hce} */
    byHce: (hce: string) => `/pacientes/${encodeURIComponent(hce)}` as const,
    /** GET/PUT/DELETE /api/v1/pacientes/by-dni/{dni} */
    byDni: (dni: string) => `/pacientes/by-dni/${encodeURIComponent(dni)}` as const,
  },
  vitalsign: {
    /** POST /api/v1/vitalsign/ */
    create: "/vitalsign/" as const,
    /** GET/PUT/DELETE /api/v1/vitalsign/{id} */
    byId: (id: number) => `/vitalsign/${id}` as const,
    /** GET /api/v1/vitalsign/dni/{dni}  y  DELETE /api/v1/vitalsign/dni/{dni} */
    byDni: (dni: string) => `/vitalsign/dni/${encodeURIComponent(dni)}` as const,
    /** GET /api/v1/vitalsign/ultimo/{dni} */
    lastByDni: (dni: string) => `/vitalsign/ultimo/${encodeURIComponent(dni)}` as const,
    /** GET /api/v1/vitalsign/by-paciente/{paciente_hce} */
    byPacienteHce: (paciente_hce: string) =>
      `/vitalsign/by-paciente/${encodeURIComponent(paciente_hce)}` as const,
  },
  consultas: {
    create: "/consultas/" as const,                                // POST
    byPaciente: (dni: string) => `/consultas/paciente/${dni}` as const,             // GET
    byMedico: (user_fullname: string) =>
      `/consultas/medico/${encodeURIComponent(user_fullname)}` as const,            // GET
    patchStatus: (consulta_dni: string) => `/consultas/${consulta_dni}/status` as const, // PATCH
    hoy: "/consultas/hoy" as const,                                 // GET
    hoyMedico: "/consultas/hoy/medico" as const,                    // GET
    totalMedico: "/consultas/total/medico" as const,                // GET
    totalMedicoUltimos7Dias: "/consultas/total/medico/ultimos7dias" as const, // GET
  },
  historial: {
    /** GET /api/v1/historial/{dni} */
    byDni: (dni: string) =>
      `/historial/${encodeURIComponent(dni)}` as const,
  },
  predict: {
    fromDni: (dni: string) => `/predict/from-dni/${dni}` as const,
    lastPredictByDni: (dni: string) => `/predict/ultimo/${dni}` as const,
    updatePredictByDni: (dni: string) => `/predict/by-dni/${dni}` as const,
  },
} as const;
