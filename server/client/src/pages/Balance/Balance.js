import React, { useState, useContext } from "react";
import { StripeProvider, Elements } from "react-stripe-elements";
import { UserContext } from "context/UserContext";
import SelectAmount from "./SelectAmount";
import CardSection from "./CardSection";
import NavBar from "../../components/NavBar";
import CreditsContainer from "./CreditsContainer";

const PurchaseCredits = () => {
  const { user } = useContext(UserContext);
  let [balance] = useState(null);
  let [credits, setCredits] = useState(1);
  let [checkout, setCheckout] = useState(false);

  const decrementCredits = () => {
    credits > 1 && setCredits(--credits);
  };
  const incrementCredits = () => {
    setCredits(++credits);
  };

  const handleToggle = () => {
    setCheckout(!checkout);
  };

  if (!user) {
    return <></>;
  }
  return (
    <>
      <NavBar />
      <CreditsContainer>
        <StripeProvider apiKey="pk_test_SiybGhOykaltlAsTtJZoMCeq00IeRPoG1J">
          {!checkout ? (
            <SelectAmount
              // if balance is null, use user context to show balance, else use state
              balance={balance || user.credits}
              credits={credits}
              decrement={decrementCredits}
              increment={incrementCredits}
              setCheckout={handleToggle}
            />
          ) : (
            <Elements>
              <CardSection credits={credits} setAddCredit={handleToggle} />
            </Elements>
          )}
        </StripeProvider>
      </CreditsContainer>
    </>
  );
};

export default PurchaseCredits;
