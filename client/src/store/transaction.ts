import { createSlice } from '@reduxjs/toolkit';
import Transaction from '../models/Transaction';

const initialState: { data: Transaction[]; form: any } = {
    data: [],
    form: {
        mode: {
            isExpand: false,
            isEdit: false,
            isDone: false,
        },
        default: {
            id: '',
            linkId: '',
            isCurrent: true,
            isExpense: true,
            amount: '',
            linkAmount: 0,
            categoryId: '',
            date: null,
            icon: '',
            titles: [''],
            tags: [''],
            memo: '',
        },
    },
};

const transactionSlice = createSlice({
    initialState,
    name: 'transaction',
    reducers: {
        clearForm(state) {
            state.form = initialState.form;
        },
        setForm(state, action) {
            const setData = action.payload;
            const form = state.form;
            form.mode = { ...form.mode, ...setData.mode };
            form.default = { ...form.default, ...setData.default };
        },
        setTransaction(state, action) {
            const transactions = action.payload;
            state.data = transactions.map((item: any) =>
                Transaction.getTransactionFromData(item)
            );

            state.data.sort((prev, next) => +next.date - +prev.date); // sort by date (desc)
        },
        addTransaction(state, action) {
            const data = state.data;
            const transaction = action.payload;

            const idx = data.findIndex((item) => item.id === transaction.id);

            if (idx === -1) {
                data.push(transaction);
            } else {
                data[idx] = transaction;
            }

            data.sort((prev, next) => +next.date - +prev.date); // sort by date (desc)
        },
        removeTransaction(state, action) {
            const data = state.data;
            const id = action.payload;
            const idx = data.findIndex((item: any) => item.id === id);
            data.splice(idx, 1);
        },
        addLink(state, action) {
            const { targetId, linkId } = action.payload;
            const idx = state.data.findIndex((item) => item.id === targetId);

            const target = state.data[idx];

            if (target) {
                target.linkId = linkId;
                state.data[idx] = target;
            }
        },
        removeLink(state, action) {
            const linkId = action.payload;
            const idx = state.data.findIndex((item: any) => item.id === linkId);

            const target = state.data[idx];

            if (target) {
                target.linkId = undefined;
                state.data[idx] = target;
            }
        },
    },
});

export const transactionActions = transactionSlice.actions;
export default transactionSlice.reducer;
