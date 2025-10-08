const axios = require('axios');

const obtenerDolarHoy = async () => {
    try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');
        const valor = response.data.rates?.UYU;

        if (!valor) return null;

        // Redondeamos a cuatro decimales
        return parseFloat(valor.toFixed(4));
    } catch (error) {
        console.error('Error al consultar API de dólar:', error);
        return null;
    }
};

module.exports = {
    obtenerDolarHoy
};