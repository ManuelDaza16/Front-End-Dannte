document.addEventListener("DOMContentLoaded", function () {
    // Vitual Select 
    VirtualSelect.init({
        ele: '#region',
        options: [
            { label: 'Barbosa', value: 'Barbosa' },
            { label: 'Barrancabermeja', value: 'Barranca' },
            { label: 'San Gil', value: 'San Gil' },
            { label: 'Socorro', value: 'Socorro' }
        ],
        multiple: true,
        search: true,
        placeholder: 'Selecciona una o más regiones',
        maxWidth: '100%' // Asegurarse de que el selector se ajuste al 100% del contenedor
    });

    // Mostrar/Ocultar secciones de Tabla y Formulario
    document.getElementById("createUser").addEventListener("click", function () {
        document.getElementById("sectionTable").classList.add("d-none");
        document.getElementById("sectionForm").classList.remove("d-none");
    });

    document.getElementById("viewTable").addEventListener("click", function () {
        document.getElementById("sectionTable").classList.remove("d-none");
        document.getElementById("sectionForm").classList.add("d-none");
    });

    // Inicializar Tabulator
    var table = new Tabulator("#userTable", {
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 10,
        columns: [
            { title: "Foto", field: "photo", formatter: "image", width: 100, formatterParams: { height: "40px", width: "40px" } },
            { title: "Nombre", field: "firstName", sorter: "string" },
            { title: "Apellido", field: "lastName", sorter: "string" },
            { title: "Cargo", field: "position", sorter: "string" },
            { title: "Rol", field: "role", sorter: "string" },
            {
                title: "Estado", field: "state", sorter: "string", formatter: iconsState
            },
            { title: "Contraseña", field: "password", formatter: "plaintext" },
            { title: "correo", field: "email" },
            { title: "Número de Contrato", field: "contract" },
            { title: "Region", field: "region" },
            { title: "Empresa", field: "company" },
            { title: "Telefono", field: "phone" },
            { title: "Acciones", field: "actions", formatter: actionButtons }
        ],
        data: [
            { photo: "https://img.freepik.com/psd-gratis/3d-ilustracion-persona-gafas-sol_23-2149436188.jpg?t=st=1726155117~exp=1726158717~hmac=89a35dc9e33dd66810dd828a207253e61ca6e635848fc979d49a1763f08d88da&w=740", firstName: "John", lastName: "Doe", position: "Analista", role: "Admin", state: "Activo",password: "1223", email: "hola@", contract: "3456724598", region: "Barbosa", company: "ESSA", phone:"343434" },
            { photo: "https://img.freepik.com/psd-gratis/3d-ilustracion-persona-gafas-sol_23-2149436188.jpg?t=st=1726155117~exp=1726158717~hmac=89a35dc9e33dd66810dd828a207253e61ca6e635848fc979d49a1763f08d88da&w=740", firstName: "Anna", lastName: "Smith", position: "Gerente", role: "Usuario", state: "Activo",password: "5456", email: "hola@",contract: "3456724598", region: "Barbosa", company: "ESSA", phone:"343434" },
            { photo: "https://img.freepik.com/psd-gratis/3d-ilustracion-persona-gafas-sol_23-2149436188.jpg?t=st=1726155117~exp=1726158717~hmac=89a35dc9e33dd66810dd828a207253e61ca6e635848fc979d49a1763f08d88da&w=740", firstName: "Lewis", lastName: "Johnson", position: "Soporte", role: "Usuario", state: "Inactivo", password: "8970", email: "hola@",contract: "3456724598", region: "Barbosa", company: "ESSA" , phone:"343434"}
        ]
    });

    // Función para renderizar los botones de acción
    function actionButtons(cell, formatterParams) {
        return `
            <button class="btn btn-warning btn-sm me-2" data-bs-toggle="modal" data-bs-target="#modalEdit"><i class="mdi mdi-pencil"></i></button>
            <button class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#modalDeleteUser"><i class="mdi mdi-delete"></i></button>
        `;
    }


    // Funcion de para los iconos del estado del usuario
    function iconsState(cell) {
        var value = cell.getValue();

        // Aplicar color solo a la columna de Estado
        if (value === "Activo") {
            return `
                    <i class="mdi mdi-check-circle-outline text-primary"></i>
`;
        } else if (value === "Inactivo") {
            return `
                <i class="mdi mdi-minus-circle-outline text-danger"></i>
            `;
        }
    }

    // Lógica para previsualizar la imagen seleccionada
    document.getElementById("uploadImageBtn").addEventListener("click", function () {
        document.getElementById("uploadImage").click();
    });

    document.getElementById("uploadImage").addEventListener("change", function () {
        var file = this.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("profileImage").src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Lógica para eliminar la imagen seleccionada y volver al placeholder
    document.getElementById("confirmDeletePhoto").addEventListener("click", function () {
        document.getElementById("profileImage").src = "https://via.placeholder.com/150";
        document.getElementById("uploadImage").value = "";  // Limpiar el input file
        var modal = bootstrap.Modal.getInstance(document.getElementById('modalDeletePhoto'));
        modal.hide();
    });

    //logica para que la contraseña se pueda ver
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');
    const passwordIcon = document.querySelector('#passwordIcon');

    togglePassword.addEventListener('click', function () {
        // Toggle the type attribute
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);

        // Toggle the icon
        passwordIcon.classList.toggle('mdi-eye');
        passwordIcon.classList.toggle('mdi-eye-off');
    });
    // Verificar si el DOM está completamente cargado antes de ejecutar
    const roleElement = document.getElementById('role');
    const phoneInput = document.getElementById('contract');

    // Evento para habilitar el campo teléfono si se selecciona "Contratista"
    roleElement.addEventListener('change', function () {
        const selectedRole = roleElement.value;

        // Si el rol es "Contratista", habilitar el campo numero de contrato
        if (selectedRole === 'contratista') {
            phoneInput.disabled = false;
        } else {
            phoneInput.disabled = true;
            phoneInput.value = ''; // Limpiar el valor si no es "Contratista"
        }
    });

    // Lógica para el campo de contratista habilitado solo cuando el rol es "Contratista"
    document.getElementById('editRole').addEventListener('change', function () {
        const selectedRole = this.value;
        const phoneInput = document.getElementById('editContract');
        if (selectedRole === 'Contratista') {
            phoneInput.disabled = false;
        } else {
            phoneInput.disabled = true;
            phoneInput.value = ''; // Limpiar si no es Contratista
        }
    });

    // Manejo del selector de empresa
    document.getElementById('company').addEventListener('change', function () {
        var company = this.value;
        var customCompanyInput = document.getElementById('customCompany');
        // Mostrar el campo para ingresar nueva empresa si se selecciona "Agregar Empresa"
        if (company === 'agregar') {
            customCompanyInput.classList.remove('d-none');
        } else {
            customCompanyInput.classList.add('d-none');
            customCompanyInput.value = ''; // Limpiar el campo si se selecciona una empresa predeterminada
        }
    });

     // Manejo del selector de empresa
    document.getElementById('editCompany').addEventListener('change', function () {
        var company = this.value;
        var customCompanyInput = document.getElementById('customCompanyEdit');
        // Mostrar el campo para ingresar nueva empresa si se selecciona "Agregar Empresa"
        if (company === 'agregar') {
            customCompanyInput.classList.remove('d-none');
        } else {
            customCompanyInput.classList.add('d-none');
            customCompanyInput.value = ''; // Limpiar el campo si se selecciona una empresa predeterminada
        }
    });

});
