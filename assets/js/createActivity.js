document.addEventListener('DOMContentLoaded', function () {
    // Inicializa el mapa con coordenadas por defecto
    let map = L.map('map').setView([7.119349, -73.122742], 13); // Coordenadas de Bucaramanga
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    let marker;

    function setMapLocation(coordinates) {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(coordinates).addTo(map);
        map.setView(coordinates, 15); // Zoom a la ubicación seleccionada
    }

    // Datos para las regiones y circuitos con coordenadas y transformadores
    let regionsData = [
        {
            name: "Región Bucaramanga",
            circuits: [
                {
                    name: "Circuito Cabecera",
                    assets: ["Activo 1", "Activo 2", "Activo 3"],
                    transformers: ["Tráfo 1", "Tráfo 2"],
                    coordinates: [7.119349, -73.122742]
                },
                {
                    name: "Circuito Girón",
                    assets: ["Activo 4", "Activo 5"],
                    transformers: ["Tráfo 3", "Tráfo 4"],
                    coordinates: [7.0682, -73.1698]
                }
            ]
        },
        {
            name: "Región Barrancabermeja",
            circuits: [
                {
                    name: "Circuito Refinería",
                    assets: ["Activo 6", "Activo 7"],
                    transformers: ["Tráfo 5", "Tráfo 6"],
                    coordinates: [7.0653, -73.8547]
                },
                {
                    name: "Circuito Miramar",
                    assets: ["Activo 8", "Activo 9"],
                    transformers: ["Tráfo 7", "Tráfo 8"],
                    coordinates: [7.0722, -73.8476]
                }
            ]
        }
    ];


    // Función para actualizar los selectores de VirtualSelect
    function updateVirtualSelect(selectorId, options) {
        VirtualSelect.setOptions(selectorId, options);
    }

    // Región
    VirtualSelect.init({
        ele: '#region',
        options: regionsData.map(region => ({ label: region.name, value: region.name })),
        placeholder: 'Seleccionar Región',
        onChange: function (value) {
            const selectedRegion = value;
            console.log('Región seleccionada:', selectedRegion);

            const regionData = regionsData.find(region => region.name === selectedRegion);
            console.log('Datos de la región seleccionada:', regionData);

            if (regionData) {
                const circuitOptions = regionData.circuits.map(circuit => ({ label: circuit.name, value: circuit.name }));
                console.log('Opciones de circuitos:', circuitOptions);

                updateVirtualSelect('#circuit', circuitOptions);
                updateVirtualSelect('#assets', []);
                updateVirtualSelect('#transformers', []);
            }
        }
    });

    // Circuito
    VirtualSelect.init({
        ele: '#circuit',
        options: [],
        placeholder: 'Seleccionar Circuito',
        onChange: function (value) {
            const selectedCircuit = value;
            const selectedRegion = VirtualSelect.getSelectedValue('#region');
            console.log('Circuito seleccionado:', selectedCircuit);
            console.log('Región actual:', selectedRegion);

            const regionData = regionsData.find(region => region.name === selectedRegion);
            const circuitData = regionData ? regionData.circuits.find(circuit => circuit.name === selectedCircuit) : null;

            console.log('Datos del circuito seleccionado:', circuitData);

            if (circuitData) {
                const assetOptions = circuitData.assets.map(asset => ({ label: asset, value: asset }));
                const transformerOptions = circuitData.transformers.map(transformer => ({ label: transformer, value: transformer }));

                console.log('Opciones de activos:', assetOptions);
                console.log('Opciones de transformadores:', transformerOptions);

                updateVirtualSelect('#assets', assetOptions);
                updateVirtualSelect('#transformers', transformerOptions);

                setMapLocation(circuitData.coordinates);
            }
        }
    });

    // Activos
    VirtualSelect.init({
        ele: '#assets',
        options: [],
        placeholder: 'Seleccionar Activos',
        multiple: true
    });

    // Transformadores
    VirtualSelect.init({
        ele: '#transformers',
        options: [],
        placeholder: 'Seleccionar Transformadores',
        multiple: true
    });

    // Prioridad
    VirtualSelect.init({
        ele: '#priority',
        options: [
            { label: 'Alta', value: 'Alta' },
            { label: 'Media', value: 'Media' },
            { label: 'Baja', value: 'Baja' }
        ],
        placeholder: 'Seleccionar Prioridad'
    });

    // Usuario asignado
    VirtualSelect.init({
        ele: '#user',
        options: [
            { label: 'Sebastian', value: 'Sebastian' },
            { label: 'Manuel', value: 'Manuel' },
            { label: 'Lina', value: 'Lina' }
        ],
        placeholder: 'Seleccionar Usuario'
    });

    // Tipo de actividad
    VirtualSelect.init({
        ele: '#activityType',
        options: [
            { label: 'Mantenimiento', value: 'Mantenimiento' },
            { label: 'Instalación', value: 'Instalación' },
            { label: 'Inspección', value: 'Inspección' }
        ],
        placeholder: 'Seleccionar Tipo de Actividad'
    });

    // Función para manejar el envío del formulario
    document.querySelector('#activity-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const activityData = {
            title: document.getElementById('activityTitle').value,
            code: document.getElementById('activityCode').value,
            priority: VirtualSelect.getValue('#priority'),
            region: VirtualSelect.getValue('#region'),
            circuit: VirtualSelect.getValue('#circuit'),
            assets: VirtualSelect.getValues('#assets'),
            transformers: VirtualSelect.getValues('#transformers'),
            activityType: VirtualSelect.getValue('#activityType'),
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value
        };

        console.log('Datos de la actividad:', activityData);
        alert('Actividad creada correctamente');
    });

    console.log('Inicialización completa');
});
