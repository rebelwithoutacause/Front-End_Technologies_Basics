window.addEventListener("load", solve);

function solve() {
    // Form elements
    const transportModeElement = document.getElementById("transport-mode");
    const departureTimeElement = document.getElementById("departure-time");
    const passengerNameElement = document.getElementById("passenger-name");
    const passengerEmailElement = document.getElementById("passenger-email");
    const passengerPhoneElement = document.getElementById("passenger-phone");

    // Buttons
    const bookBtn = document.getElementById('book-btn');
    const editBtn = document.getElementById('edit-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    const backBtn = document.getElementById('back-btn');

    // Sections
    const previewSection = document.getElementById('preview');
    const confirmationSection = document.getElementById('confirmation');

    // Preview fields
    const previewTransportMode = document.getElementById('preview-transport-mode');
    const previewDepartureTime = document.getElementById('preview-departure-time');
    const previewPassengerName = document.getElementById('preview-passenger-name');
    const previewPassengerEmail = document.getElementById('preview-passenger-email');
    const previewPassengerPhone = document.getElementById('preview-passenger-phone');

    // Book Transport button
    bookBtn.addEventListener('click', () => {
        // Validate all fields
        if (!transportModeElement.value ||
            !departureTimeElement.value ||
            !passengerNameElement.value ||
            !passengerEmailElement.value ||
            !passengerPhoneElement.value) {
            return;
        }

        // Fill preview
        previewTransportMode.textContent = transportModeElement.value;
        previewDepartureTime.textContent = departureTimeElement.value;
        previewPassengerName.textContent = passengerNameElement.value;
        previewPassengerEmail.textContent = passengerEmailElement.value;
        previewPassengerPhone.textContent = passengerPhoneElement.value;

        // Show preview and disable book button
        previewSection.style.display = 'block';
        bookBtn.disabled = true;

        // Clear form
        transportModeElement.value = '';
        departureTimeElement.value = '';
        passengerNameElement.value = '';
        passengerEmailElement.value = '';
        passengerPhoneElement.value = '';
    });

    // Edit button
    editBtn.addEventListener('click', () => {
        // Restore values from preview
        transportModeElement.value = previewTransportMode.textContent;
        departureTimeElement.value = previewDepartureTime.textContent;
        passengerNameElement.value = previewPassengerName.textContent;
        passengerEmailElement.value = previewPassengerEmail.textContent;
        passengerPhoneElement.value = previewPassengerPhone.textContent;

        // Hide preview and enable book button
        previewSection.style.display = 'none';
        bookBtn.disabled = false;
    });

    // Confirm button
    confirmBtn.addEventListener('click', () => {
        previewSection.style.display = 'none';
        confirmationSection.style.display = 'block';
    });

    // Back button
    backBtn.addEventListener('click', () => {
        confirmationSection.style.display = 'none';
        bookBtn.disabled = false;
    });
}
