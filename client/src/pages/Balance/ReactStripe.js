import React, { useState, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe
} from "@stripe/react-stripe-js";
import { UserContext } from "context/UserContext";
import { Grid, Button, makeStyles, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { authHeader } from "functions/jwt";
import "./common.css";
import axios from "axios";

const CARD_OPTIONS = {
  iconStyle: "solid",
  style: {
    base: {
      iconColor: "#fff",
      color: "#fff",
      fontWeight: 500,
      fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      ":-webkit-autofill": {
        color: "#fce883"
      },
      "::placeholder": {
        color: "#fff"
      }
    },
    invalid: {
      iconColor: "#e8977e",
      color: "#e8977e"
    }
  }
};

const CardField = ({ onChange }) => (
  <div className="FormRow">
    <CardElement options={CARD_OPTIONS} onChange={onChange} />
  </div>
);

const Field = ({
  label,
  id,
  type,
  placeholder,
  required,
  autoComplete,
  value,
  onChange
}) => (
  <div className="FormRow">
    <label htmlFor={id} className="FormRowLabel">
      {label}
    </label>
    <input
      className="FormRowInput"
      id={id}
      type={type}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
    />
  </div>
);

const ErrorMessage = ({ children }) => (
  <div className="ErrorMessage" role="alert">
    <svg width="16" height="16" viewBox="0 0 17 17">
      <path
        fill="#FFF"
        d="M8.5,17 C3.80557963,17 0,13.1944204 0,8.5 C0,3.80557963 3.80557963,0 8.5,0 C13.1944204,0 17,3.80557963 17,8.5 C17,13.1944204 13.1944204,17 8.5,17 Z"
      />
      <path
        fill="#6772e5"
        d="M8.5,7.29791847 L6.12604076,4.92395924 C5.79409512,4.59201359 5.25590488,4.59201359 4.92395924,4.92395924 C4.59201359,5.25590488 4.59201359,5.79409512 4.92395924,6.12604076 L7.29791847,8.5 L4.92395924,10.8739592 C4.59201359,11.2059049 4.59201359,11.7440951 4.92395924,12.0760408 C5.25590488,12.4079864 5.79409512,12.4079864 6.12604076,12.0760408 L8.5,9.70208153 L10.8739592,12.0760408 C11.2059049,12.4079864 11.7440951,12.4079864 12.0760408,12.0760408 C12.4079864,11.7440951 12.4079864,11.2059049 12.0760408,10.8739592 L9.70208153,8.5 L12.0760408,6.12604076 C12.4079864,5.79409512 12.4079864,5.25590488 12.0760408,4.92395924 C11.7440951,4.59201359 11.2059049,4.59201359 10.8739592,4.92395924 L8.5,7.29791847 L8.5,7.29791847 Z"
      />
    </svg>
    {children}
  </div>
);

const useStyles = makeStyles({
  text: {
    fontSize: "3vw",
    fontWeight: "800"
  },
  button: {
    backgroundColor: "#43DDC1",
    marginTop: "1vh",
    marginBottom: "1vh",
    width: "75%"
  },
  link: {
    textDecoration: "none"
  }
});

const CheckoutForm = ({ setAddCredit, credits }) => {
  const { user } = useContext(UserContext);
  const classes = useStyles();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [billingDetails, setBillingDetails] = useState({ name: "" });
  const [madeSuccessfulPayment, setMadeSuccessfulPayment] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    if (error) {
      elements.getElement("card").focus();
      return;
    }

    if (cardComplete) {
      setProcessing(true);
    }

    const requestPaymentIntent = await axios.post(
      `/user/${user._id}/purchase-credit`,
      {
        credits
      },
      authHeader()
    );

    const payload = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
      billing_details: billingDetails
    });

    const confirm = await stripe.confirmCardPayment(
      `${requestPaymentIntent.data.clientSecret}`,
      {
        payment_method: payload.paymentMethod.id
      }
    );

    if (confirm.paymentIntent && confirm.paymentIntent.status === "succeeded") {
      setMadeSuccessfulPayment(true);
      setProcessing(false);
      const { data } = await axios.put(
        `/user/${user._id}/add-credit`,
        {
          credits
        },
        authHeader()
      );
      if (data.success) {
        setMadeSuccessfulPayment(true);
        user.credits += credits;
      }
    } else if (confirm.error) {
      setError(confirm.error);
      setProcessing(false);
    }
  };

  const goToAddCredits = () => {
    setMadeSuccessfulPayment(false);
    setAddCredit(true);
  };

  const buttonText = () => {
    if (error) {
      return "Try again";
    } else if (processing) {
      return "Processing...";
    }
  };

  return madeSuccessfulPayment ? (
    <>
      <Grid container direction="column" spacing={6}>
        <Grid item xs={12}>
          <Typography className={classes.text}>Payment Complete</Typography>
        </Grid>
        <Grid container item direction="row" xs={12} justify="center">
          <Grid item xs={6}>
            <Button
              className={classes.button}
              color="primary"
              variant="contained"
              onClick={goToAddCredits}
            >
              View Balance
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Link to="/code-upload" className={classes.link}>
              <Button
                className={classes.button}
                color="primary"
                variant="contained"
              >
                Upload Code
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </>
  ) : (
    <form className="Form" onSubmit={handleSubmit}>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <fieldset className="FormGroup">
            <Field
              label="Name"
              id="name"
              type="text"
              placeholder="Jane Doe"
              required
              autoComplete="name"
              value={billingDetails.name}
              onChange={e => {
                setBillingDetails({ ...billingDetails, name: e.target.value });
              }}
            />
          </fieldset>
          <fieldset className="FormGroup">
            <CardField
              onChange={e => {
                setError(e.error);
                setCardComplete(e.complete);
              }}
            />
          </fieldset>

          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </Grid>
        <Grid container item direction="row">
          <Grid item xs={6}>
            <Button
              className={classes.button}
              color="primary"
              variant="contained"
              onClick={setAddCredit}
            >
              Edit cart
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              className={classes.button}
              color="primary"
              variant="contained"
              onClick={handleSubmit}
              disabled={processing}
            >
              {processing || error ? buttonText() : `Pay $${credits * 5}`}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

const ELEMENTS_OPTIONS = {
  fonts: [
    {
      cssSrc: "https://fonts.googleapis.com/css?family=Roboto"
    }
  ]
};

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe("pk_test_SiybGhOykaltlAsTtJZoMCeq00IeRPoG1J");

const App = ({ setAddCredit, credits }) => {
  return (
    <div className="AppWrapper">
      <Elements stripe={stripePromise} options={ELEMENTS_OPTIONS}>
        <CheckoutForm setAddCredit={setAddCredit} credits={credits} />
      </Elements>
    </div>
  );
};

export default App;
