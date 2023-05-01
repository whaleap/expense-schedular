import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks/redux-hook';
import Amount from '../../../models/Amount';
import { budgetCategoryActions } from '../../../store/budget-category';
import { totalActions } from '../../../store/total';
import { updateBudgetFields, updateCategoryPlan } from '../../../util/api/budgetAPI';
import { getExpensePlannedKey, getFilteredCategories } from '../../../util/filter';
import AmountBars from '../../Budget/Amount/AmountBars';
import EditInput from '../../Budget/Input/EditInput';
import CategoryPlanButtons from '../../Budget/UI/CategoryPlanButtons';
import ExpenseTab from '../../Budget/UI/ExpenseTab';
import classes from './DefaultStatus.module.css';

const DefaultStatus = (props: { budgetId: string }) => {
  const dispatch = useDispatch();

  const [isExpense, setIsExpense] = useState(true);

  const total = useAppSelector((state) => state.total);
  const totalAmount = isExpense ? total.expense : total.income;

  const categories = useAppSelector((state) =>
    isExpense ? state.budgetCategory.expense : state.budgetCategory.income
  );

  // 예정 내역이 추가될 경우 -> 목표가 예정보다 작으면 업데이트
  useEffect(() => {
    if (totalAmount.planned < totalAmount.scheduled) {
      dispatch(
        totalActions.updateTotalAmount({ isExpense, planned: totalAmount.scheduled })
      );
    }

    categories.forEach((item) => {
      const amount = item.amount;
      if (amount.planned < amount.scheduled) {
        updateCategoryPlan(props.budgetId, item.id, amount.scheduled);
        dispatch(
          budgetCategoryActions.updateCategoryAmount({
            categoryId: item.id,
            isExpense,
            planned: amount.scheduled,
          })
        );
      }
    });
  }, [totalAmount.scheduled]);

  // TODO: 목표내역이 수정될 경우 -> 전체 목표가 카테고리별 목표의 합보다 작으면 경고

  // Handlers for plan amounts
  const confirmTotalHandler = async (total: string) => {
    const confirmedTotal = +total.replace(/[^0-9]+/g, '');

    // send Request
    const key = getExpensePlannedKey(isExpense);
    const { budget } = await updateBudgetFields(props.budgetId, {
      [key]: confirmedTotal,
    });

    // Update total plan state
    dispatch(totalActions.updateTotalAmount({ isExpense, planned: confirmedTotal }));
    // Update category plan state
    dispatch(budgetCategoryActions.setCategoryFromData(budget.categories));
  };

  const convertTotalHandler = (value: string) => {
    return value.replace(/[^0-9]/g, '');
  };

  return (
    <>
      <ExpenseTab
        id="default-type"
        className={classes.tab}
        isExpense={isExpense}
        setIsExpense={setIsExpense}
      />
      <div className={classes.container}>
        {/* Scheduled amount */}
        <div className={classes.scheduled}>
          <span>예정</span>
          <p className={classes.total}>{Amount.getAmountStr(totalAmount.scheduled)}</p>
        </div>
        {/* Planned amount */}
        <div className={classes.planned}>
          <label htmlFor="default-budget-plan">목표</label>
          <EditInput
            id="default-budget-plan"
            className={classes.plan}
            editClass={classes.planEdit}
            cancelClass={classes.planCancel}
            value={Amount.getAmountStr(totalAmount.planned)}
            min={totalAmount.scheduled}
            convertDefaultValue={convertTotalHandler}
            confirmHandler={confirmTotalHandler}
          />
        </div>
        {/* Planned chart */}
        <AmountBars
          className={classes.bars}
          borderRadius="0.4rem"
          amountData={categories.map((item) => {
            return {
              label: item.icon,
              amount: item.amount.planned,
            };
          })}
        />
        {/* Plan buttons */}
        <CategoryPlanButtons />
      </div>
    </>
  );
};

export default DefaultStatus;
