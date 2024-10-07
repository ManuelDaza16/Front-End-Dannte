document.addEventListener('DOMContentLoaded', function () {
    let isEditing = false;  // Estado de edición deshabilitado por defecto
    let filteredActivities = [];
    let activities = []; // Definir activities en el ámbito global dentro de la función
    // Historial de cambios inventados
    let changeHistory = [
        { field: "Fecha de inicio", oldValue: "2024-01-01", newValue: "2024-01-05", dateModified: "2024-01-10 14:30", comments: "Se modifico la fecha de inico" },
        { field: "Progreso", oldValue: "En ejecución", newValue: "Finalizada", dateModified: "2024-01-15 10:15", comments: "Se modifico el progrso" },
        { field: "Prioridad", oldValue: "Media", newValue: "Alta", dateModified: "2024-01-20 12:00", comments: "Se modifico la prioridad" },
    ];

    // Inicializar tooltip de Bootstrap para el botón de movilizar
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Seleccionar los botones y secciones
    const kanvasButton = document.getElementById('btn-kanvas');
    const calendarButton = document.getElementById('btn-calendar');
    const kanvasSection = document.getElementById('kanvas');
    const calendarSection = document.getElementById('calendar');

    // IDs de las listas de tareas
    const taskLists = ['scheduled', 'inProgress', 'defeated', 'overdueExecution', 'completed', 'completedExpired'];

    // Mostrar SweetAlert "Cargando datos" al inicio
    Swal.fire({
        title: 'Cargando datos',
        text: 'Por favor espera mientras se cargan los datos...',
        icon: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading(); // Mostrar el ícono de carga
        }
    });

    // Variable para controlar el tiempo mínimo de visualización de la alerta
    const minLoadingTime = 2000; // 2 segundos
    const startTime = new Date().getTime(); // Guardar el tiempo inicial

    // Función para cargar los datos, pero no construir aún
    function loadActivities(callback) {
        $.ajax({
            url: './assets/JSON/calendar.json',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                activities = data.activities; // Asignar las actividades al ámbito global    

                // Calcular el tiempo transcurrido
                const elapsedTime = new Date().getTime() - startTime;

                // Esperar el tiempo restante si la carga fue muy rápida
                if (elapsedTime < minLoadingTime) {
                    setTimeout(() => {
                        Swal.close(); // Cerrar SweetAlert después de que pasen 4 segundos
                        callback();  // Llamar al callback para construir la UI
                    }, minLoadingTime - elapsedTime);
                } else {
                    Swal.close(); // Si ya pasó más de 4 segundos, cerramos el SweetAlert de inmediato
                    callback();  // Llamar al callback para construir la UI
                }
            },
            error: function (error) {
                console.error('Error al cargar el JSON de actividades:', error);

                // Mostrar un error en SweetAlert si la carga de datos falla
                Swal.fire({
                    title: 'Error',
                    text: 'Hubo un error al cargar los datos. Inténtalo nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        });
    }

    // Función para construir la interfaz una vez los datos estén cargados
    function buildUI() {
        generateActivityCards(activities);
        updateCalendar(activities);

        // Inicializar filtros dinámicos
        initializeActivityTypeFilter(activities); // Inicializar filtro de tipo de actividad
        initializeRegionFilter(activities);       // Inicializar filtro de región
        initializeActivityCodeFilter(activities); // Inicializar filtro de código de actividads
    }

    // Llamar a la función para cargar las actividades y luego construir la UI
    loadActivities(buildUI);

    // Inicializar listas de tareas con SortableJS
    taskLists.forEach(id => {
        new Sortable(document.getElementById(id), {
            group: 'shared',
            animation: 150,
            onEnd: function (evt) {
                const item = evt.item;  // El elemento movido
                // Mostrar SweetAlert2 para confirmar el cambio
                Swal.fire({
                    title: '¿Confirmar cambio?',
                    text: "Estás moviendo la actividad a otro estado. ¿Deseas confirmar esta modificación?",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Mostrar SweetAlert de "Procesando" durante 2 segundos
                        Swal.fire({
                            title: 'Procesando',
                            text: 'Por favor espera...',
                            icon: 'info',
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            timer: 2000,  // Duración de 2 segundos
                            willClose: () => {
                                // Después de 2 segundos, mostrar el mensaje de éxito
                                Swal.fire('¡Cambio realizado!', 'La actividad se ha movido correctamente.', 'success');
                            }
                        });
                    } else {
                        // Si no se confirma, revertir el cambio
                        evt.from.insertBefore(item, evt.from.children[evt.oldIndex]);
                        Swal.fire('¡Acción cancelada!', 'La actividad ha vuelto a su posición original.', 'info');
                    }
                });
            }
        });
    });

    // Función para inicializar el filtro de Tipo de Actividad
    function initializeActivityTypeFilter(activities) {
        const uniqueActivityTypes = [...new Set(activities.map(activity => activity.activityType))];
        const activityTypeOptions = uniqueActivityTypes.map(type => {
            return { label: type, value: type };
        });

        VirtualSelect.init({
            ele: '#activityFilter',
            options: activityTypeOptions,
            hideClearButton: true,
            placeholder: "Tipo de actividad"
        });
    }

    // Función para inicializar el filtro de Región
    function initializeRegionFilter(activities) {
        const uniqueRegions = [...new Set(activities.map(activity => activity.region))];
        const regionOptions = uniqueRegions.map(region => {
            return { label: region, value: region };
        });

        VirtualSelect.init({
            ele: '#regionFilter',
            options: regionOptions,
            hideClearButton: true,
            placeholder: "Región"
        });
    }

    // Inicializar Virtual Select para código de actividad
    function initializeActivityCodeFilter(activities) {
        const uniqueActivityCodes = [...new Set(activities.map(activity => activity.activityCode))];

        const activityCodeOptions = uniqueActivityCodes.map(code => {
            return { label: code, value: code };
        });

        VirtualSelect.init({
            ele: '#activityCodeFilter',
            options: activityCodeOptions,
            hideClearButton: true,
            placeholder: "Código de actividad"
        });
    }

    // Función para obtener la clase de Bootstrap según el estado
    function getStatusClass(status) {
        switch (status) {
            case 'En ejecución':
                return 'bg-info text-dark border-0';
            case 'Vencida':
                return 'bg-danger text-white border-0';
            case 'Programada':
                return 'bg-success text-light border-0';
            case 'Vencida en ejecución':
                return 'bg-ultra-purple text-light border-0';
            case 'Finalizada':
                return 'bg-primary text-light border-0';
            case 'Finalizada vencida':
                return 'bg-electric-purple text-light border-0';
        }
    }

    // Función para actualizar el calendario
    // Función para actualizar el calendario
    function updateCalendar(filteredActivities) {
        var calendarActivity = document.getElementById('calendar');

        // Destruir el calendario existente antes de recrearlo
        if (calendarActivity._calendar) {
            calendarActivity._calendar.destroy();
        }

        var calendar = new FullCalendar.Calendar(calendarActivity, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today', // Botones de navegación
                center: 'title', // Título centrado
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            locale: 'es',
            themeSystem: 'bootstrap5',
            aspectRatio: 2.5,
            editable: false,
            events: filteredActivities.map(activity => {
                const bootstrapClass = getStatusClass(activity.status); // Obtener la clase Bootstrap según el estado
                return {
                    title: activity.activityType,
                    start: activity.startDate,
                    end: activity.endDate,
                    classNames: [bootstrapClass], // Aplicar la clase Bootstrap
                    extendedProps: {
                        description: activity.description || 'No hay descripción disponible',
                        region: activity.region || 'Región no especificada',
                        status: activity.status || 'Sin estado',
                        image: activity.user?.photo || 'url_defecto.jpg', // Validar si hay imagen
                        priority: activity.priority || 'No asignada', // Prioridad por defecto
                        comments: activity.comments || 'Sin comentarios', // Comentarios por defecto
                        lastUpdate: activity.lastUpdate || { date: 'Sin fecha', note: 'Sin nota' },
                        name: activity.user?.name, // Validar el nombre del usuario
                        pdf: activity.pdf || '#', // Enlace al PDF
                        OT: activity.OT || [], // Si no existen, asignar un array vacío
                        cosignation: activity.cosignation || [], // Si no existen, asignar un array vacío
                        lacManeuvers: activity.LACmaneuvers || '', // Asignar LACmaneuvers
                        activityCode: activity.activityCode
                    }
                };
            }),
            eventDrop: function (info) {
                // Mostrar SweetAlert2 para confirmar el cambio de fecha
                Swal.fire({
                    title: '¿Confirmar cambio?',
                    text: "Has movido la actividad a otra fecha. ¿Deseas confirmar esta modificación?",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Mostrar SweetAlert de "Procesando" durante 2 segundos
                        Swal.fire({
                            title: 'Procesando',
                            text: 'Por favor espera...',
                            icon: 'info',
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            timer: 2000,  // Duración de 2 segundos
                            willClose: () => {
                                // Después de 2 segundos, mostrar el mensaje de éxito
                                Swal.fire('¡Cambio realizado!', 'La actividad se ha movido correctamente.', 'success');
                            }
                        });
                    } else {
                        // Si no se confirma, revertir el cambio
                        info.revert();
                        Swal.fire('¡Acción cancelada!', 'La actividad ha vuelto a su posición original.', 'info');
                    }
                });
            },
            eventResize: function (info) {
                // Mostrar SweetAlert2 para confirmar el cambio de duración
                Swal.fire({
                    title: '¿Confirmar cambio?',
                    text: "Has cambiado la duración de la actividad. ¿Deseas confirmar esta modificación?",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Mostrar SweetAlert de "Procesando" durante 2 segundos
                        Swal.fire({
                            title: 'Procesando',
                            text: 'Por favor espera...',
                            icon: 'info',
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            timer: 2000,  // Duración de 2 segundos
                            willClose: () => {
                                // Después de 2 segundos, mostrar el mensaje de éxito
                                Swal.fire('¡Cambio realizado!', 'La duración de la actividad se ha cambiado correctamente.', 'success');
                            }
                        });
                    } else {
                        // Si no se confirma, revertir el cambio de tamaño
                        info.revert();
                        Swal.fire('¡Acción cancelada!', 'La actividad ha vuelto a su duración original.', 'info');
                    }
                });
            },
            eventClick: function (info) {
                showPopup(info); // Mostrar la ventana flotante con la información del evento
            }
        });

        // Guardar referencia del nuevo calendario
        calendarActivity._calendar = calendar;

        calendar.render();
    }

    // Función para generar las cards de actividades en el kanvas
    function generateActivityCards(filteredActivities) {
        const states = {
            'Programada': 'scheduled',
            'En ejecución': 'inProgress',
            'Vencida': 'defeated',
            'Vencida en ejecución': 'overdueExecution',
            'Finalizada': 'completed',
            'Finalizada vencida': 'completedExpired'
        };

        // Limpiar las listas de actividades
        Object.values(states).forEach(state => {
            document.getElementById(state).innerHTML = ''; // Vaciar columnas
        });

        filteredActivities.forEach(activity => {
            const card = `
            <div class="card border mb-3 p-3 bg-light">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <span class="badge bg-secondary">${activity.region}</span>
                        <span class="badge bg-primary ms-2">Código: ${activity.activityCode}</span>
                    </div>
                    <small class="text-dark fw-bold mb-2">${activity.endDate}</small>
                </div>
                <p class="mb-2">${activity.description}</p>
                <p class="mb-1">Prioridad: ${activity.priority}</p>
                <div class="d-flex align-items-center justify-content-end">
                    <img src="${activity.user?.photo || 'url_defecto.jpg'}" alt="${activity.user?.name || 'Usuario'}" class="rounded-circle me-2" width="40">
                    <strong>${activity.user?.name || 'Usuario'}</strong>
                </div>
            </div>
            `;

            document.getElementById(states[activity.status]).innerHTML += card;
        });
    }

    // Inicializar tooltips de Bootstrap
    const modifyButton = document.getElementById('modifyButton');

    // Establecer el ícono predeterminado cuando la página carga por primera vez
    modifyButton.innerHTML = '<i class="bi bi-arrows-move"></i>'; // Ícono por defecto

    var modifyButtonTooltip = new bootstrap.Tooltip(modifyButton, {
        trigger: 'hover'
    });

    // Función para alternar entre editar y no editar el calendario
    modifyButton.addEventListener('click', function () {
        var calendarActivity = document.getElementById('calendar');

        if (calendarActivity._calendar) {
            if (!isEditing) {
                // Habilitar la edición y cambiar el ícono y tooltip
                calendarActivity._calendar.setOption('editable', true);
                modifyButton.innerHTML = '<i class="bi bi-x-circle"></i>'; // Cambiar ícono a desactivar
                modifyButton.setAttribute('data-bs-original-title', 'Movimiento desactivado');  // Cambiar texto del tooltip
            } else {
                // Deshabilitar la edición y cambiar el ícono y tooltip
                calendarActivity._calendar.setOption('editable', false);
                modifyButton.innerHTML = '<i class="bi bi-arrows-move"></i>'; // Cambiar ícono a activar
                modifyButton.setAttribute('data-bs-original-title', 'Movimiento activado');  // Cambiar texto del tooltip
            }

            // Alternar el estado de edición
            isEditing = !isEditing;

            // Ocultar el tooltip después de hacer clic
            modifyButtonTooltip.hide();
            modifyButtonTooltip.update();  // Actualizar el tooltip con el nuevo contenido
        }
    });

    // Función para mostrar Kanvas y ocultar Calendario
    kanvasButton.addEventListener('click', function () {
        kanvasSection.classList.remove('d-none');
        calendarSection.classList.add('d-none');
        modifyButton.classList.add('d-none'); // Ocultar el botón de movilizar en Kanvas
        closePopup()
    });

    // Función para mostrar Calendario y ocultar Kanvas
    calendarButton.addEventListener('click', function () {
        kanvasSection.classList.add('d-none');
        calendarSection.classList.remove('d-none');
        modifyButton.classList.remove('d-none'); // Mostrar el botón de movilizar solo en el Calendario

        // Forzar el renderizado del calendario después de que se haga visible
        if (calendarSection._calendar) {
            calendarSection._calendar.render();
        }
    });

    // Función para mostrar el popup con los detalles del evento
    function showPopup(info) {
        const popup = document.getElementById('eventPopup');

        // Llenar los campos del popup con la información del evento
        document.getElementById('popupTitle').textContent = info.event.title + ' (' + info.event.extendedProps.activityCode + ')';
        document.getElementById('popupDates').textContent = info.event.start.toLocaleDateString() + " - " + info.event.end.toLocaleDateString();
        document.getElementById('popupDescription').textContent = info.event.extendedProps.description;
        document.getElementById('popupRegion').textContent = info.event.extendedProps.region;
        document.getElementById('popupStatus').textContent = info.event.extendedProps.status;
        document.getElementById('popupPriority').textContent = info.event.extendedProps.priority || 'No asignada';
        document.getElementById('popupComments').textContent = info.event.extendedProps.comments || 'Sin comentarios';
        document.getElementById('popupImage').src = info.event.extendedProps.image;
        document.getElementById('popupUserName').textContent = info.event.extendedProps.name || 'Sin nombre';

        // Mostrar el popup
        popup.classList.remove('d-none');
        popup.classList.add('d-block');

        // Configurar el evento para ver la nota
        document.getElementById('viewNoteBtn').addEventListener('click', function () {
            const lastUpdate = info.event.extendedProps.lastUpdate;

            if (lastUpdate) {
                document.getElementById('lastUpdateDate').textContent = lastUpdate.date || 'Sin fecha';
                document.getElementById('lastUpdateNote').textContent = lastUpdate.note || 'Sin nota';
            } else {
                document.getElementById('lastUpdateDate').textContent = 'Sin fecha';
                document.getElementById('lastUpdateNote').textContent = 'Sin nota';
            }
        });

        // Configurar el enlace al PDF
        document.getElementById('pdfLink').href = info.event.extendedProps.pdf;

        // Abrir el modal de actualización y rellenar los datos cuando se haga clic en "Actualizar"
        document.querySelector('[data-bs-target="#update"]').addEventListener('click', function () {
            fillUpdateForm(info); // Pasar el objeto info correctamente
        });
    }

    // Referencia al botón de eliminar actividad
    var deleteActivityBtn = document.getElementById('deleteActivityBtn');

    // Función para eliminar actividad
    function deleteActivity() {
        // Mostrar ventana emergente de SweetAlert2 para confirmar la eliminación
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {

                console.log("Se elimino la actividad");


                // Mostrar un mensaje de éxito
                Swal.fire(
                    '¡Eliminado!',
                    'La actividad ha sido eliminada.',
                    'success'
                );

                // Cerrar el popup después de eliminar
                closePopup();
            }
        });
    }

    // Asociar la función de eliminar actividad al botón
    deleteActivityBtn.addEventListener('click', deleteActivity);

    // Inicializar tabla de Tabulator para el historial de cambios
    function initHistoryTable() {
        new Tabulator("#changeHistoryTable", {
            layout: "fitColumns",
            data: changeHistory,  // Mostrar datos inventados
            columns: [
                { title: "Campo", field: "field", formatter: "plaintext" },
                { title: "Valor Antiguo", field: "oldValue", formatter: "plaintext" },
                { title: "Valor Nuevo", field: "newValue", formatter: "plaintext" },
                { title: "Fecha de Modificación", field: "dateModified", formatter: "plaintext" },
                { title: "Comentarios", field: "comments", formatter: "plaintext" }
            ]
        });
    }

    // Mostrar el modal de historial de cambios al hacer clic en "Ver histórico"
    document.getElementById('viewHistory').addEventListener('click', function () {
        $('#update').modal('hide'); // Ocultar el modal principal
        initHistoryTable();
        $('#historyModal').modal('show'); // Mostrar el modal del histórico
    });

    // Mostrar el modal padre cuando se cierra el modal de historial
    $('#historyModal').on('hidden.bs.modal', function () {
        $('#update').modal('show'); // Mostrar el modal principal al cerrar el de histórico
    });

    // Simular el envío de solicitud de cambio de fecha
    document.getElementById('submitDateChange').addEventListener('click', function () {
        let newStartDate = document.getElementById('newStartDate').value;
        let newEndDate = document.getElementById('newEndDate').value;
        let activityCode = "ACT-123";  // Código de actividad inventado

        if (newStartDate && newEndDate) {
            Swal.fire({
                title: 'Procesando solicitud',
                text: `Se solicita el cambio de fecha de la actividad con código ${activityCode} de ${newStartDate} a ${newEndDate}.`,
                icon: 'info',
                confirmButtonText: 'Ok'
            }).then(() => {
                Swal.fire({
                    title: 'Enviando solicitud...',
                    text: 'Por favor espera.',
                    icon: 'info',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    timer: 4000,
                    willClose: () => {
                        Swal.fire({
                            title: '¡Solicitud enviada!',
                            text: 'Tu solicitud de cambio de fecha ha sido enviada correctamente.',
                            icon: 'success',
                            confirmButtonText: 'Ok'
                        });
                    }
                });

                // Imprimir la solicitud en la consola
                console.log(`Solicitud de cambio de fecha para la actividad ${activityCode} de ${newStartDate} a ${newEndDate}`);
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Debe seleccionar ambas fechas.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    });

    // Función para abrir el modal de actualización y rellenar los datos
    function fillUpdateForm(info) {
        document.getElementById('taskModalLabel').textContent = 'Detalles de la tarea (' + info.event.extendedProps.activityCode + ')';
        document.getElementById('typeActivity').value = info.event.title;
        document.getElementById('progress').value = info.event.extendedProps.status;
        document.getElementById('priority').value = info.event.extendedProps.priority || 'Media';
        document.getElementById('startDateModal').value = info.event.start.toISOString().split('T')[0];
        document.getElementById('endDateModal').value = info.event.end.toISOString().split('T')[0];
        document.getElementById('description').value = info.event.extendedProps.description || '';
        document.getElementById('comments').value = info.event.extendedProps.comments || '';

        // Mostrar la sección si el estado es 'Finalizada'
        if (info.event.extendedProps.status === 'Finalizada') {
            document.getElementById('finalizadaSection').classList.remove('d-none');
            document.getElementById('lacManeuvers').value = info.event.extendedProps.lacManeuvers || '';

            // Inicializar la tabla de Tabulator para OT
            var otTable = new Tabulator("#otTable", {
                layout: "fitColumns",
                columns: [
                    { title: "OT", field: "OT", editor: "input" }
                ],
                cellEdited: function (cell) {
                    // Actualizar el array OT cuando una celda es editada
                    info.event.extendedProps.OT = otTable.getData().map(row => row.OT);
                },
                addRowPos: "bottom" // Nueva fila en la parte inferior
            });

            // Esperar a que la tabla OT esté construida
            otTable.on("tableBuilt", function () {
                // Verificar si hay datos en OT
                if (Array.isArray(info.event.extendedProps.OT) && info.event.extendedProps.OT.length > 0) {
                    otTable.setData(info.event.extendedProps.OT.map(ot => ({ OT: ot })));
                } else {
                    otTable.addRow({ OT: "" }); // Añadir fila vacía si no hay datos
                }

                // Evento para añadir una fila nueva al presionar "Enter" en la tabla de OT
                document.querySelector('#otTable').addEventListener('keydown', function (event) {
                    if (event.key === 'Enter') {
                        otTable.addRow({ OT: "" });
                    }
                });
            });

            // Inicializar la tabla de Tabulator para Cosignaciones
            var cosignationTable = new Tabulator("#cosignationTable", {
                layout: "fitColumns",
                columns: [
                    { title: "Cosignación", field: "cosignation", editor: "input" }
                ],
                cellEdited: function (cell) {
                    // Actualizar el array de cosignaciones cuando una celda es editada
                    info.event.extendedProps.cosignation = cosignationTable.getData().map(row => row.cosignation);
                },
                addRowPos: "bottom" // Nueva fila en la parte inferior
            });

            // Esperar a que la tabla de Cosignación esté construida
            cosignationTable.on("tableBuilt", function () {
                // Verificar si hay datos en cosignation
                if (Array.isArray(info.event.extendedProps.cosignation) && info.event.extendedProps.cosignation.length > 0) {
                    cosignationTable.setData(info.event.extendedProps.cosignation.map(cos => ({ cosignation: cos })));
                } else {
                    cosignationTable.addRow({ cosignation: "" }); // Añadir fila vacía si no hay datos
                }

                // Evento para añadir una fila nueva al presionar "Enter" en la tabla de Cosignaciones
                document.querySelector('#cosignationTable').addEventListener('keydown', function (event) {
                    if (event.key === 'Enter') {
                        cosignationTable.addRow({ cosignation: "" });
                    }
                });
            });

        } else {
            document.getElementById('finalizadaSection').classList.add('d-none');
        }
    }

    // Función para cerrar el popup al hacer clic fuera de él
    function closeOnClickOutside(event) {
        const popup = document.getElementById('eventPopup');
        if (!popup.contains(event.target)) {
            closePopup();
        }
    }

    // Función para cerrar el popup
    function closePopup() {
        const popup = document.getElementById('eventPopup');
        popup.classList.add('d-none');
        popup.classList.remove('d-block');
        // Volver a permitir que se abra el popup
        document.removeEventListener('click', closeOnClickOutside);
    }

    // Evento para cerrar el popup con el ícono de cerrar
    document.querySelector('.close-icon').addEventListener('click', closePopup);

    // Cerrar el popup al cambiar los filtros
    document.getElementById('activityFilter').addEventListener('change', closePopup);
    document.getElementById('regionFilter').addEventListener('change', closePopup);

    // Función para aplicar los filtros combinados
    function applyFilters(activities) {
        const selectedType = document.querySelector('#activityFilter').value;
        const selectedRegion = document.querySelector('#regionFilter').value;
        const selectedCode = document.querySelector('#activityCodeFilter').value;
        const selectedStartDate = document.querySelector('#startDateFilter').value;
        const selectedEndDate = document.querySelector('#endDateFilter').value;

        filteredActivities = activities;

        // Mostrar SweetAlert de "Procesando" durante 2 segundos
        Swal.fire({
            title: 'Procesando búsqueda',
            text: 'Por favor espera...',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 2000,  // Duración de 2 segundos
            willClose: () => {
                // Aplicar filtros solo si se seleccionaron valores
                if (selectedType) {
                    filteredActivities = filteredActivities.filter(activity => activity.activityType === selectedType);
                }
                if (selectedRegion) {
                    filteredActivities = filteredActivities.filter(activity => activity.region === selectedRegion);
                }
                if (selectedCode) {
                    filteredActivities = filteredActivities.filter(activity => activity.activityCode === selectedCode);
                }
                if (selectedStartDate) {
                    filteredActivities = filteredActivities.filter(activity => new Date(activity.startDate) >= new Date(selectedStartDate));
                }
                if (selectedEndDate) {
                    filteredActivities = filteredActivities.filter(activity => new Date(activity.endDate) <= new Date(selectedEndDate));
                }

                // Actualizar tanto el calendario como el kanvas
                updateCalendar(filteredActivities);
                generateActivityCards(filteredActivities);

                // Después de 2 segundos, mostrar el mensaje de éxito que se cierre solo
                Swal.fire({
                    title: '¡Búsqueda completada!',
                    text: 'Se han aplicado los filtros correctamente.',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1000  // Duración del mensaje de éxito antes de cerrarse automáticamente
                });
            }
        });
    }

    // Asociar la función de aplicar los filtros al botón "Buscar"
    document.getElementById('applyFilters').addEventListener('click', function () {
        applyFilters(activities);  // Llama a la función que ya tienes para aplicar los filtros
    });

    // Función para limpiar los filtros
    function clearFilters() {
        // Mostrar SweetAlert de "Procesando" durante 2 segundos
        Swal.fire({
            title: 'Limpiando filtros',
            text: 'Por favor espera...',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 2000,  // Duración de 2 segundos
            willClose: () => {
                // Limpiar cada Virtual Select individualmente usando el método reset directamente
                document.querySelector('#activityFilter').virtualSelect.reset();
                document.querySelector('#regionFilter').virtualSelect.reset();
                document.querySelector('#activityCodeFilter').virtualSelect.reset();

                // Limpiar las fechas
                document.getElementById('startDateFilter').value = '';
                document.getElementById('endDateFilter').value = '';

                // Mostrar todas las actividades después de limpiar los filtros
                updateCalendar(activities);
                generateActivityCards(activities);

                // Después de 2 segundos, mostrar el mensaje de éxito que se cierre solo
                Swal.fire({
                    title: '¡Filtros limpiados!',
                    text: 'Se han limpiado todos los filtros correctamente.',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1000  // Duración del mensaje de éxito antes de cerrarse automáticamente
                });
            }
        });
    }

    // Asociar la función de limpiar filtros al botón "Limpiar"
    document.getElementById('clearFilters').addEventListener('click', function () {
        clearFilters();
    });

});
