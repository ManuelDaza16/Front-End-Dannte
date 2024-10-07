document.addEventListener('DOMContentLoaded', function () {
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
})