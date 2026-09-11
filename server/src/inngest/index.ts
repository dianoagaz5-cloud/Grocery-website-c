import { inngest } from './client';
import { checkLowStock, autoAssignRider, sendMonthlyOffers } from './functions';

export const inngestFunctions = [checkLowStock, autoAssignRider, sendMonthlyOffers];

export { inngest };
export default inngestFunctions;
