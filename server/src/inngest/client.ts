import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'grocery-delivery-api',
  name: 'InstantMart Grocery API',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export default inngest;
