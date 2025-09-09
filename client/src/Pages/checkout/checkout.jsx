import React from "react";
import axios from "axios";

const RazorpayPayment = () => {


    const displayRazorpay = async () => {
        try {
            const { data } = await axios.post("https://razorpay-p2yw.onrender.com/api/create-order", {
                amount: 50,
            });
            console.log(data, "from created order");
            const options = {
                key: "rzp_test_RF49y8ygBJhI36",
                amount: data.amount,
                currency: data.currency,
                name: "Ozrit",
                description: "Test Transaction",
                order_id: data.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post("https://razorpay-p2yw.onrender.com/api/verify-payment", response);
                        alert(JSON.stringify(verifyRes.data));
                    } catch (err) {
                        console.error("Payment verification failed:", err);
                    }
                },
                prefill: {
                    name: "veeresh",
                    email: "ozrit@example.com",
                },
                theme: { color: "#d9e5ebff" },
            };
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            console.error("Error creating Razorpay order:", err);
        }
    };


    return (
        <div>
            <h2>Razorpay Test Payment</h2>
            <button onClick={displayRazorpay}>Pay ₹50</button>
        </div>
    );
};

export default RazorpayPayment;
