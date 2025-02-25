import React from 'react';
import CardDetailsWidget from '../../components/Stripe/CardDetailsWidget';
import IssuingAuthorizationsWidget from '../../components/Stripe/IssuingAuthorizationsWidget';
import {getCardTransactions} from '../../utils/stripe_helpers.js';
import {decode} from '../../utils/jwt_encode_decode';
import {parse} from 'cookie';
import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function getServerSideProps(context) {
  if ('cookie' in context.req.headers) {
    const cookie = parse(context.req.headers.cookie);
    if ('app_auth' in cookie) {
      const session = decode(cookie.app_auth);
      const cardId = context.params.cardId;
      const StripeAccountID = session.accountId;
      let cardTransactions = await getCardTransactions(StripeAccountID, cardId);

      return {
        props: {
          cardAuthorizations: cardTransactions.card_authorizations,
          CurrentSpend: cardTransactions.current_spend,
          account: StripeAccountID,
          cardId: context.params.cardId,
          cardDetails: cardTransactions.card_details,
        },
      };
    }
  }
  return {
    redirect: {
      destination: '/signin',
    },
  };
}

const CardDetails = (props) => {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    {
      stripeAccount: props.account,
      betas: ['issuing_elements_2'],
    },
  );

  return (
    <div>
      <Elements stripe={stripePromise}>
        <CardDetailsWidget
          accountId={props.account}
          cardId={props.cardId}
          cardDetails={props.cardDetails}
          currentSpend={props.CurrentSpend}
        />
        <IssuingAuthorizationsWidget
          cardAuthorizations={props.cardAuthorizations}
        />
      </Elements>
    </div>
  );
};

export default CardDetails;
