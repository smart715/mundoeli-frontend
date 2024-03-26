import { createSelector } from 'reselect';

const selectCheckout = (state) => state.checkout;

export const selectCurrentItem = createSelector([selectCheckout], (checkout) => checkout.items);

export const selectListItems = createSelector([selectCheckout], (checkout) => checkout.list);
export const selectItemById = (itemId) =>
    createSelector(selectListItems, (list) => list.result.items.find((item) => item._id === itemId));