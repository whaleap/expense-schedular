import React, { useImperativeHandle, useRef, useState } from 'react';
import classes from './Select.module.css';

const Select = React.forwardRef(
    (
        props: {
            className?: string;
            data: { value: string; label: string }[];
            defaultValue?: string;
            onChange?: (event?: React.ChangeEvent) => void;
        },
        ref
    ) => {
        useImperativeHandle(ref, () => {
            return {
                value: () => {
                    return selectRef.current!.value;
                },
            };
        });

        const selectRef = useRef<HTMLSelectElement>(null);
        const [isExpand, setIsExpand] = useState(false);

        const toggleList = () => {
            setIsExpand((prev) => !prev);
        };

        const closeList = () => {
            setIsExpand(false);
        };

        const expandClass = isExpand ? classes.expand : '';

        return (
            <div
                className={`${classes.container} ${expandClass} ${props.className}`}
            >
                <div className={classes.backdrop} onClick={closeList} />
                <div className={classes.wrapper} onClick={toggleList}>
                    <div className={classes.clickable} />
                    <select
                        ref={selectRef}
                        defaultValue={props.defaultValue}
                        onChange={props.onChange}
                        disabled
                    >
                        {props.data.map((item, i) => (
                            <option key={i} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                    <ul>
                        <div className={classes.list}>
                            {props.data.map((item, i) => {
                                return <li key={i}>{item.label}</li>;
                            })}
                        </div>
                    </ul>
                </div>
            </div>
        );
    }
);

export default Select;
