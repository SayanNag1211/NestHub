document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    const submitBtn = document.getElementById('submitBtn');
    const buttonText = submitBtn.querySelector('.button-text');
    const spinner = submitBtn.querySelector('.spinner-border');
    const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
    const resultData = document.getElementById('resultData');
    const getLocationBtn = document.getElementById('getLocationBtn');

    // Input validation patterns
    const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
    };

    function validateInput(input) {
        let isValid = true;

        if (input.required && !input.value.trim()) {
            isValid = false;
        } else if (input.type === 'email' && !patterns.email.test(input.value)) {
            isValid = false;
        } else if (input.type === 'tel' && !patterns.phone.test(input.value)) {
            isValid = false;
        }

        input.classList.toggle('is-invalid', !isValid);
        return isValid;
    }

    // Geolocation functionality
    async function getAddressFromCoords(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error('Error getting address:', error);
            throw new Error('Failed to get address from coordinates');
        }
    }

    getLocationBtn.addEventListener('click', async function() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        // Show loading state
        getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        getLocationBtn.disabled = true;
        form.classList.add('loading-location');

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            const address = await getAddressFromCoords(
                position.coords.latitude,
                position.coords.longitude
            );

            document.getElementById('address').value = address;
        } catch (error) {
            console.error('Error:', error);
            alert('Unable to retrieve your location. Please enter your address manually.');
        } finally {
            // Reset button state
            getLocationBtn.innerHTML = '<i class="fas fa-location-dot"></i>';
            getLocationBtn.disabled = false;
            form.classList.remove('loading-location');
        }
    });

    // Real-time validation
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateInput(this);
            }
        });
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate all inputs
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
                input.classList.add('is-invalid');
            }
        });

        if (!isValid) {
            return;
        }

        // Show loading state
        buttonText.textContent = 'Submitting...';
        spinner.classList.remove('d-none');
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = {
                fullName: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                occupation: document.getElementById('occupation').value.trim(),
                address: document.getElementById('address').value.trim()
            };

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Display collected data
            resultData.textContent = JSON.stringify(formData, null, 2);
            resultModal.show();

            // Reset form
            form.reset();
            inputs.forEach(input => input.classList.remove('is-invalid'));
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the form. Please try again.');
        } finally {
            // Reset button state
            buttonText.textContent = 'Submit Information';
            spinner.classList.add('d-none');
            submitBtn.disabled = false;
        }
    });
});