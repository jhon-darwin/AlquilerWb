document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('paymentsTable').getElementsByTagName('tbody')[0];

    // Cargar pagos del localStorage
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');

    // Llenar la tabla con los pagos
    payments.forEach(payment => {
        const row = table.insertRow();
        row.insertCell(0).textContent = payment.month;
        row.insertCell(1).textContent = payment.receiver;
        row.insertCell(2).textContent = payment.amount;
        row.insertCell(3).textContent = payment.date;
    });

    // Botón para volver a la página principal
    document.getElementById('goBack').onclick = function() {
        window.location.href = 'alquiler_index.html';
    }
});