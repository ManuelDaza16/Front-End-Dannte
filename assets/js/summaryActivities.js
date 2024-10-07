// Datos de ejemplo para la tabla
var activities = [
    { deposit: "Mantenimiento", region: "San Alberto", circuit: "59502", creation: "12/09/2023", due: "30/06/2024", status: "En ejecución", overdue_days: "", task: "Inspección de podas con motoniliero" },
    { deposit: "Podas", region: "Barranca", circuit: "LN 492", creation: "30/04/2024", due: "30/09/2024", status: "Vencida", overdue_days: "138", task: "Inspección de Podas por BT en el Trafo apoyo 7837542" },
    { deposit: "Mantenimiento", region: "Cimitarra", circuit: "210 501", creation: "02/02/2024", due: "30/09/2024", status: "Programada", overdue_days: "", task: "Inspección de Fusibles por MT y BT" },
    { deposit: "Mantenimiento", region: "Metro Norte", circuit: "33503", creation: "07/02/2024", due: "30/09/2024", status: "Finalizada", overdue_days: "", task: "Inspección de Mantenimiento por BT" },
];

function getStatusClass(status) {
    switch (status) {
        case 'En ejecución':
            return 'background-color: #49c9f6 !important; color: #020317 !important;';
        case 'Vencida':
            return 'background-color: #9c00f7 !important; color: #fff !important;';
        case 'Programada':
            return 'background-color: #707783 !important; color: #fff !important;';
        case 'Vencida en ejecución':
            return 'background-color: #c000ff !important; color: #212529 !important;';
        case 'Finalizada':
            return 'background-color: #19163c !important; color: #fff !important;';
        case 'Finalizada vencida':
            return 'background-color: #7d00ff !important; color: #fff !important;';
        default:
            return '';
    }
}

// Inicialización de Tabulator para la tabla
var table = new Tabulator("#activities-table", {
    data: activities, // Tus datos
    layout: "fitColumns", // Ajustar columnas al ancho disponible
    columns: [
        { title: "Nombre del depósito", field: "deposit", headerFilter: "input" }, // Sin ancho fijo
        { title: "Región", field: "region", headerFilter: "input" },
        { title: "Circuito", field: "circuit", headerFilter: "input" },
        { title: "Fecha de creación", field: "creation", headerFilter: "input" },
        { title: "Fecha de vencimiento", field: "due", headerFilter: "input" },
        { 
            title: "Estado", 
            field: "status", 
            headerFilter: "input", 
            formatter: function(cell, formatterParams) {
                var status = cell.getValue(); // Obtener el valor del estado
                var element = cell.getElement(); // Obtener el elemento DOM de la celda

                // Aplicar estilo en línea
                var style = getStatusClass(status);
                element.setAttribute("style", style);

                return status; // Retornar el valor del estado para mostrarlo en la celda
            },
        },
        { title: "Días vencidos", field: "overdue_days", headerFilter: "input" },
        { title: "Nombre de la tarea", field: "task", headerFilter: "input" },
    ],
});

// Datos para las tablas adicionales
var depositData = [
    { depositName: "Mantenimiento", execution: 111, notStarted: 723, completed: 309, overdue: 403, total: 1546 },
    { depositName: "Podas", execution: 65, notStarted: 371, completed: 251, overdue: 426, total: 1113 },
    { depositName: "Operación y Calidad", execution: 8, notStarted: 24, completed: 24, overdue: 20, total: 76 },
    { depositName: "Expansión y Reposición", execution: 2, notStarted: 53, completed: 53, overdue: 5, total: 60 },
    // Más datos aquí...
];

var regionData = [
    { regionName: "Barranca", execution: 23, notStarted: 144, completed: 76, overdue: 281, total: 524 },
    { regionName: "San Alberto", execution: 38, notStarted: 4, completed: 132, overdue: 270, total: 444 },
    { regionName: "Barbosa", execution: 28, notStarted: 273, completed: 54, overdue: 22, total: 377 },
    { regionName: "Cimitarra", execution: 19, notStarted: 8, completed: 123, overdue: 198, total: 348 },
    // Más datos aquí...
];

// Configuración de la tabla "Nombre del Depósito"
var depositTable = new Tabulator("#deposit-table", {
    data: depositData,
    layout: "fitColumns", // Cambiar a fitColumns para ajustar al ancho disponible
    columns: [
        { title: "Depósito", field: "depositName" , headerFilter: "input" },
        { title: "Ejecución", field: "execution" , headerFilter: "input" },
        { title: "Sin Empezar", field: "notStarted" , headerFilter: "input" },
        { title: "Terminada", field: "completed", headerFilter: "input"  },
        { title: "Vencido", field: "overdue", headerFilter: "input"  },
        { title: "Total", field: "total" , headerFilter: "input" },
    ],
});

// Configuración de la tabla "Región"
var regionTable = new Tabulator("#region-table", {
    data: regionData,
    layout: "fitColumns", // Cambiar a fitColumns para ajustar al ancho disponible
    columns: [
        { title: "Región", field: "regionName", headerFilter: "input"  },
        { title: "Ejecución", field: "execution", headerFilter: "input"  },
        { title: "Sin Empezar", field: "notStarted" , headerFilter: "input" },
        { title: "Terminada", field: "completed" , headerFilter: "input" },
        { title: "Vencido", field: "overdue" , headerFilter: "input" },
        { title: "Total", field: "total" , headerFilter: "input" },
    ],
});