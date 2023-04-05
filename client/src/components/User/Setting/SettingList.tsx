import classes from './SettingList.module.css';
import SettingItem from './SettingItem';

function SettingList(props: {
    title: string;
    items: { icon: string; label: string; show: (isShow: boolean) => void }[];
}) {
    return (
        <ul className={classes.container}>
            <h5>{props.title}</h5>
            {props.items.map((item, i) => (
                <SettingItem
                    key={i}
                    icon={item.icon}
                    label={item.label}
                    show={item.show}
                />
            ))}
        </ul>
    );
}

export default SettingList;
