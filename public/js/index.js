// init Stripe
let stripe;
const stripePk = fetch("/conf/stripe_pk")
    .then(resp => resp.text())
    .then(pk => stripe = Stripe(pk))
    .catch((err) => {
        reject(err);
    });

checkStatus();

// fetch customers list
let customers;
window.onload = (e) => {
    document.querySelector("#customer-select").classList.add("busy");
    fetch("/api/customer", { method: "GET" }).then(resp => {
        return resp.json();
    }).then(jsonData => {
        const customersList = jsonData.list;

        if ( Array.isArray(customersList) ) {
            const clSelect = document.querySelector("#customers");
            customersList.forEach(c => {
                const option = document.createElement("option");
                option.value = c.clientCustomerId;
                option.text = c.name + ' ' + c.description;
                clSelect.appendChild(option);
            });

            customers = new Map(
                customersList.map(obj => {return [obj.clientCustomerId, obj];})
            );
        }
    }).finally(() => {
        document.querySelector("#customer-select").classList.remove("busy");
    });
};

// Set amount handler
document
        .querySelector("#payment-form")
        .addEventListener("submit", handleSetAmount);

async function handleSetAmount(e) {
    e.preventDefault();
    document.querySelector("#payment-status").innerHTML = '';

    const amount = document.querySelector("#amount").value;
    const customer_id = document.querySelector("#customers").value;
    const payment_method = document.querySelector("input[name=payment-method]").value;

    if ( !amount || !customer_id || !payment_method ) {
        console.error("Please set all required parameters");
        return false;
    }

    const form = document.querySelector("#payment-form");

    form.classList.add("busy");
    const resp = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({amount, customer_id, payment_method})
    });
    form.classList.remove("busy");

    const { clientSecret } = await resp.json();

    if ( !clientSecret ) {
        console.error("Failed to get client secret");
        return false;
    }

    // got a secret key, now it's Stripe turn
    const appearance = {
        theme: 'stripe',
    };
    elements = stripe.elements({ clientSecret, appearance });

    const linkAuthenticationElement = elements.create("linkAuthentication", {defaultValues: {email: customers.get(customer_id).email}});
    linkAuthenticationElement.mount("#link-authentication-element");

    linkAuthenticationElement.on('change', (event) => {
        emailAddress = event.value.email;
    });

    const paymentElementOptions = {
        layout: "tabs"
    };

    const paymentElement = elements.create("payment", paymentElementOptions);
    paymentElement.mount("#payment-element");

    // show confirm button
    document.querySelector("#payment-confirm").style.display = "block";
}

// Set confirm payment handler
document
        .querySelector("#btn-payment-confirm")
        .addEventListener("click", handlePaymentConfirm);

async function handlePaymentConfirm(e) {
    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            return_url: window.location.href
        },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
        console.error(error.message);
    } else {
        console.error("An unexpected error occurred.");
    }
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
    const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
    );

    if ( !clientSecret ) {
        return;
    }

    const statusDiv = document.querySelector("#payment-status");
    const msgDiv = document.createElement("div");
    msgDiv.className = "alert";
    msgDiv.setAttribute("role", "alert");

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

    switch (paymentIntent.status) {
        case "succeeded":
            msgDiv.className += " alert-success";
            msgDiv.innerText = "Payment succeeded!";
            break;
        case "processing":
            msgDiv.className += " alert-info";
            msgDiv.innerText = "Your payment is processing.";
            break;
        case "requires_payment_method":
            msgDiv.className += " alert-warning";
            msgDiv.innerText = "Your payment was not successful, please try again.";
            break;
        default:
            msgDiv.className += " alert-danger";
            msgDiv.innerText = "Something went wrong.";
            break;
    }

    statusDiv.appendChild(msgDiv);
}
