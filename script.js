document.addEventListener('DOMContentLoaded', function() {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const table = document.getElementById('rentTable').getElementsByTagName('tbody')[0];
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const paymentForm = document.getElementById('paymentForm');
    const dateTypeSelect = document.getElementById('dateType');
    const startDateInput = document.getElementById('startDate');
    let currentMonth;

    // Cargar datos guardados
    function loadSavedData() {
        const savedDateType = localStorage.getItem('dateType');
        const savedStartDate = localStorage.getItem('startDate');
        const savedPayments = JSON.parse(localStorage.getItem('payments') || '[]');

        if (savedDateType) dateTypeSelect.value = savedDateType;
        if (savedStartDate) startDateInput.value = savedStartDate;

        return savedPayments;
    }

    // Guardar datos
    function saveData() {
        localStorage.setItem('dateType', dateTypeSelect.value);
        localStorage.setItem('startDate', startDateInput.value);
    }

    // Inicializar la tabla
    function initTable() {
        const startDateValue = startDateInput.value;
        if (!startDateValue) return; // No hacer nada si no hay fecha ingresada

        saveData(); // Guardar la configuración actual

        const startDate = new Date(startDateValue);
        const currentDate = new Date();
        const is30DayMode = dateTypeSelect.value === '30days';

        table.innerHTML = '';

        const startDay = startDate.getDate();
        const startMonth = startDate.getMonth();
        const startYear = startDate.getFullYear();

        const savedPayments = loadSavedData();

        for (let i = 0; i < 12; i++) {
            const row = table.insertRow();
            const monthCell = row.insertCell(0);
            let currentMonth, currentYear, formattedDate;

            if (is30DayMode) {
                const newDate = new Date(startDate);
                newDate.setDate(newDate.getDate() + i * 30);
                currentMonth = newDate.getMonth();
                currentYear = newDate.getFullYear();
                formattedDate = `${newDate.getDate()}/${currentMonth + 1}/${currentYear}`;
            } else {
                currentMonth = (startMonth + i) % 12;
                currentYear = startYear + Math.floor((startMonth + i) / 12);
                formattedDate = `${startDay}/${currentMonth + 1}/${currentYear}`;
            }
            
            monthCell.textContent = `${months[currentMonth]} (${formattedDate})`;

            const statusCell = row.insertCell(1);
            statusCell.textContent = 'Pendiente';

            const actionCell = row.insertCell(2);
            const payButton = document.createElement('button');
            payButton.textContent = 'Pagar';
            payButton.classList.add('btn-primary');
            payButton.onclick = () => openModal(i);
            actionCell.appendChild(payButton);

            // Comprobar si hay un pago guardado para este mes
            const savedPayment = savedPayments.find(p => p.month === monthCell.textContent);
            if (savedPayment) {
                statusCell.textContent = 'Pagado';
                actionCell.innerHTML = '<i class="fas fa-check"></i>';
            }

            if (currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear()) {
                row.classList.add('warning');
                if (statusCell.textContent === 'Pendiente') {
                    row.classList.add('blink');
                }
            }
        }
    }

    // Abrir el modal
    function openModal(monthIndex) {
        currentMonth = monthIndex;
        modal.style.display = 'block';
        document.getElementById('amount').value = '250'; // Establecer el valor por defecto
    }

    // Cerrar el modal
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // Cuando el usuario hace clic fuera del modal, cerrarlo
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Manejar el envío del formulario de pago
    paymentForm.onsubmit = function(e) {
        e.preventDefault();
        const receiver = document.getElementById('receiver').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const date = new Date().toLocaleString();

        // Actualizar la tabla
        table.rows[currentMonth].cells[1].textContent = 'Pagado';
        table.rows[currentMonth].classList.remove('blink');
        table.rows[currentMonth].cells[2].innerHTML = '<i class="fas fa-check"></i>';

        // Guardar en localStorage
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.push({
            month: table.rows[currentMonth].cells[0].textContent,
            receiver: receiver,
            amount: amount,
            date: date
        });
        localStorage.setItem('payments', JSON.stringify(payments));

        modal.style.display = 'none';
        paymentForm.reset();
    }

    // Ver pagos realizados
    document.getElementById('viewPayments').onclick = function() {
        window.open('payments.html', '_blank');
    }

    // Función para generar un código aleatorio
    function generateRandomCode() {
        return Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    // Función para mostrar un diálogo de confirmación personalizado
    function customConfirm(message, code) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                z-index: 1000;
            `;
            dialog.innerHTML = `
                <p>${message}</p>
                <p>Para confirmar, ingresa el código: <strong>${code}</strong></p>
                <input type="text" id="confirmCode" />
                <button id="confirmYes">Confirmar</button>
                <button id="confirmNo">Cancelar</button>
            `;
            document.body.appendChild(dialog);

            document.getElementById('confirmYes').onclick = () => {
                const input = document.getElementById('confirmCode');
                if (input.value === code) {
                    document.body.removeChild(dialog);
                    resolve(true);
                } else {
                    alert('Código incorrecto. Intenta de nuevo.');
                }
            };
            document.getElementById('confirmNo').onclick = () => {
                document.body.removeChild(dialog);
                resolve(false);
            };
        });
    }

    // Resetear tabla con una sola confirmación de código
    document.getElementById('resetTable').onclick = async function() {
        const confirmationCode = generateRandomCode();
        const isConfirmed = await customConfirm('¿Estás seguro de que quieres resetear la tabla? Esta acción eliminará todos los datos y no se puede deshacer.', confirmationCode);
        
        if (isConfirmed) {
            localStorage.removeItem('payments');
            localStorage.removeItem('dateType');
            localStorage.removeItem('startDate');
            alert('La tabla ha sido reseteada. La página se recargará.');
            location.reload();
        } else {
            alert('Reseteo cancelado. Tus datos están a salvo.');
        }
    };

    // Cargar JSON
    document.getElementById('loadJson').onclick = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => { 
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = readerEvent => {
                const content = readerEvent.target.result;
                localStorage.setItem('payments', content);
                initTable(); // Reinicializar la tabla con los datos cargados
            }
        }
        input.click();
    }

    // Guardar JSON
    document.getElementById('saveJson').onclick = function() {
        const payments = localStorage.getItem('payments') || '[]';
        const blob = new Blob([payments], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pagos_alquiler.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }

    // Enviar JSON a WhatsApp
    document.getElementById('sendWhatsApp').onclick = function() {
        const payments = localStorage.getItem('payments') || '[]';
        const phoneNumber = prompt("Ingrese el número de teléfono (con código de país, sin espacios ni símbolos):");
        if (phoneNumber) {
            const message = encodeURIComponent(`Datos de pagos de alquiler:\n${payments}`);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
            window.open(whatsappUrl, '_blank');
        }
    }

    // Manejar el cambio de fecha de inicio o tipo de fecha
    startDateInput.onchange = initTable;
    dateTypeSelect.onchange = initTable;

    // Cargar datos guardados e inicializar la tabla
    loadSavedData();
    initTable();
});