import { createSelector } from 'reselect';

const selectCrud = (state) => state.crud;

export const selectCurrentItem = createSelector([selectCrud], (crud) => crud.current);

export const selectListItems = createSelector([selectCrud], (crud) => crud.list);
export const selectItemById = (itemId) =>
  createSelector(selectListItems, (list) => list.result.items.find((item) => item._id === itemId));

export const selectCreatedItem = createSelector([selectCrud], (crud) => crud.create);

export const selectUpdatedItem = createSelector([selectCrud], (crud) => crud.update);

export const selectReadItem = createSelector([selectCrud], (crud) => crud.read);

export const selectDeletedItem = createSelector([selectCrud], (crud) => crud.delete);

export const selectSearchedItems = createSelector([selectCrud], (crud) => crud.search);
export const selectFilteredItemsByParent = createSelector([selectCrud], (crud) => crud.listById);
export const selectListsByEmergency = createSelector([selectCrud], (crud) => crud.listByEmergency);
export const selectListsByMedical = createSelector([selectCrud], (crud) => crud.listByMedical);
export const selectListsByContract = createSelector([selectCrud], (crud) => crud.listByContract);
export const selectListsByCustomer = createSelector([selectCrud], (crud) => crud.listByCustomer);
export const selectListsByCustomerContact = createSelector([selectCrud], (crud) => crud.listByCustomerContact);
export const selectListsByCustomerStores = createSelector([selectCrud], (crud) => crud.listByCustomerStores);
export const selectListsByAssignedEmployee = createSelector([selectCrud], (crud) => crud.listByAssignedEmployee);
export const selectListsByRecurrent = createSelector([selectCrud], (crud) => crud.listByRecurrent);
export const selectListsByInvoice = createSelector([selectCrud], (crud) => crud.listByInvoice);
export const selectListsByDocument = createSelector([selectCrud], (crud) => crud.listByDocument);
export const selectListsByEDocument = createSelector([selectCrud], (crud) => crud.listByEDocument);
