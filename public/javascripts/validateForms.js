    // Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
    
// Select all forms with the class name
    const forms = document.querySelectorAll('.validated-form');
    
// Create an array from queryselector, Loop over it and prevent submission
    Array.from(forms)
        .forEach(function (form) {
        form.addEventListener('submit', function (event) {
        // if not valid prevent default and stop
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
    
            form.classList.add('was-validated')
        }, false)
        })
})()