import React, {FC} from "react";
import {useNavigate} from "react-router-dom";
import './button.scss'

interface ButtonProps {
    /** Color of background (white, black, grey)*/
    color: string;

    /** Style of button (primary, secondary, tertiary) */
    styleButton: string;

    /** Text button */
    text: string;

    /** if button toke all space */
    fullWidth?: boolean;

    /** Click */
    click?: React.MouseEventHandler;

    /** If button is disabled */
    disabled?: boolean;

    /** path */
    href?: string;

    /** loader */
    loading?: boolean;
}

const Button: FC<ButtonProps> = ({color, styleButton= 'basic', text, fullWidth = false, click, disabled = false, href= "", loading = false}) => {
    /** For navigation */
    const navigate = useNavigate();

    /**
     * Function to navigate
     * @param path
     */
    function toNavigate(path: string | undefined) {
        navigate(`/${path}`);
    }

    switch (true) {
        case styleButton == 'link':
            return (
                <button disabled={disabled} onClick={click} className={`style-${styleButton} ${disabled ? 'disabled' : ''} background-${color} ${fullWidth ? 'full' : null}`}>
                    <img className={'loader'} src={'/images/loading-yellow.svg'} alt={'loader'}/>
                    {text}
                </button>
            )
        case href != undefined && href !== '':
            return <button onClick={() => toNavigate(href)} disabled={disabled} className={`style-${styleButton} ${disabled ? 'disabled':''} background-${color} classic ${fullWidth ? 'full':null}`}>{text}</button>
        default:
            return (
                <button disabled={disabled} onClick={click} className={`style-${styleButton} ${disabled ? 'disabled' : ''} background-${color} classic ${fullWidth ? 'full' : null}`}>
                    {
                       loading ? <img className={'loader'} src={`/images/loading${color === 'dark'? '-white':''}.svg`} alt={'loader'}/>:text
                    }
                </button>
            )
    }

}

export default Button
