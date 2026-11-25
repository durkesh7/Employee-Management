import api from "./client.js";

export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

export const employeeService = {
  list: (params) => api.get("/employees", { params }).then((r) => r.data),
  get: (id) => api.get(`/employees/${id}`).then((r) => r.data),
  create: (data) => api.post("/employees", data).then((r) => r.data),
  update: (id, data) => api.put(`/employees/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/employees/${id}`).then((r) => r.data),
  stats: () => api.get("/employees/stats").then((r) => r.data),
  departments: () => api.get("/employees/departments").then((r) => r.data),
};
<<<<<<< HEAD

export const studentService = {
  list: () => api.get("/students").then((r) => r.data),
  get: (id) => api.get(`/students/${id}`).then((r) => r.data),
  create: (data) => api.post("/students", data).then((r) => r.data),
  update: (id, data) => api.put(`/students/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/students/${id}`).then((r) => r.data),
};

export const salaryService = {
  list: (params) => api.get("/salaries", { params }).then((r) => r.data),
  get: (id) => api.get(`/salaries/${id}`).then((r) => r.data),
  create: (data) => api.post("/salaries", data).then((r) => r.data),
  update: (id, data) => api.put(`/salaries/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/salaries/${id}`).then((r) => r.data),
};

export const dashboardService = {
  summary: () => api.get("/dashboard/summary").then((r) => r.data),
};
=======
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9
