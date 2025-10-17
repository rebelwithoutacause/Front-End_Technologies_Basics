window.addEventListener("load", solve);

function solve() {
    //Main input fields
    const ticketsNumElement = document.getElementById("num-tickets");
    const seatingElement = document.getElementById("seating-preference");
    const nameElement = document.getElementById("full-name");
    const emailElement = document.getElementById("email");
    const phoneElement = document.getElementById("phone-number");

    //step 2 elements to put values from input fields
    const purchaseTicketNumElement = document.getElementById("purchase-num-tickets");
    const purchaseSeatingElement = document.getElementById("purchase-seating-preference");
    const purchaseNameElement = document.getElementById("purchase-full-name");
    const purchaseEmailElement = document.getElementById("purchase-email");
    const purchasePhoneElement = document.getElementById("purchase-phone-number");

    //containers to show/hide
    const ticketPreviewElement = document.getElementById("ticket-preview");
    const purchaseSuccessElement = document.getElementById("purchase-success");

    const purchaseBtnElement = document.getElementById("purchase-btn");
    purchaseBtnElement.addEventListener("click", onAdd);

    function onAdd(e) {
        e.preventDefault()

        const allFieldsAreFilled = ticketsNumElement.value !== "" &&
            seatingElement.value !== "" &&
            nameElement.value !== "" &&
            emailElement.value !== "" &&
            phoneElement.value !== "";

        if (!allFieldsAreFilled) {
            return;
        }

        purchaseTicketNumElement.textContent = ticketsNumElement.value;
        purchaseSeatingElement.textContent = seatingElement.value;
        purchaseNameElement.textContent = nameElement.value;
        purchaseEmailElement.textContent = emailElement.value;
        purchasePhoneElement.textContent = phoneElement.value;

        ticketPreviewElement.style.display = "block";
        purchaseBtnElement.disabled = true;

        ticketsNumElement.value = "";
        seatingElement.value = "";
        nameElement.value = "";
        emailElement.value = "";
        phoneElement.value = "";

    }

    const editBtnElement = document.getElementById("edit-btn");
    editBtnElement.addEventListener("click", onEdit);

    function onEdit() {
       
        ticketsNumElement.value = purchaseTicketNumElement.textContent;
        seatingElement.value = purchaseSeatingElement.textContent;
        nameElement.value = purchaseNameElement.textContent;
        emailElement.value = purchaseEmailElement.textContent;
        phoneElement.value = purchasePhoneElement.textContent;

        ticketPreviewElement.style.display = "none";
        purchaseBtnElement.disabled = false;

    }

    const buyBtnElement = document.getElementById("buy-btn");
    buyBtnElement.addEventListener("click", onBuy);
    
    function onBuy() {
        ticketPreviewElement.style.display = "none";
        purchaseSuccessElement.style.display = "block";
    }

    const backBtnElement = document.getElementById("back-btn");
    backBtnElement.addEventListener("click", onBack);
    
    function onBack() {
        purchaseSuccessElement.style.display = "none";
        purchaseBtnElement.disabled = false;
    }
}