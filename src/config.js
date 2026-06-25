export const API_BASE =
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE) ||
  (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_BASE) ||
  '/api'
