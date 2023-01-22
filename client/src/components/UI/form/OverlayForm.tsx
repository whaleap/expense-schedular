import classes from './OverlayForm.module.css';

function OverlayForm(props: {
    onSubmit: (event: React.FormEvent) => void;
    isShowBackdrop?: boolean;
    children?: React.ReactNode;
}) {

    const preventEnterSubmitHandler = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    }

    return (
        <>
            {props.isShowBackdrop ? (
                <div className={classes.backdrop}></div>
            ) : null}
            <form className={classes.overlay} onSubmit={props.onSubmit} onKeyDown={preventEnterSubmitHandler}>
                {props.children}
            </form>
        </>
    );
}

export default OverlayForm;
