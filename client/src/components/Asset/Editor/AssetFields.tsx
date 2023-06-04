import classes from './AssetFields.module.css';

interface AssetFieldsProps {
  amount: number;
  setAmount: (value: number) => void;
}

// TODO: NumberInput 개발 후 원 표시라던지 그런 거 수정
const AssetFields = ({ amount, setAmount }: AssetFieldsProps) => {
  const amountHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(+event.target.value);
  };

  const focusHandler = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === '0') {
      event.target.value = '';
    }
  };

  const blurHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setAmount(0);
    }
  };

  const keyHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (event.currentTarget.value === '0') {
        event.currentTarget.value = '';
      }
    }
  };

  return (
    <div className={classes.fields}>
      <label htmlFor="asset-field-amount" className={classes.label}>
        잔액
      </label>
      <input
        id="asset-field-amount"
        className={classes.amount}
        type="number"
        value={amount}
        onChange={amountHandler}
        onFocus={focusHandler}
        onKeyUp={keyHandler}
        onBlur={blurHandler}
      />
    </div>
  );
};

export default AssetFields;
