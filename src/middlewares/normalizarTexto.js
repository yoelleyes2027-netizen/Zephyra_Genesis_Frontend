// backend/MyWords/normalizarTexto.js
const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quita tildes
      .trim();
  };
  
  module.exports = normalizarTexto;