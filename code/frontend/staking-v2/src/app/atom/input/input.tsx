import React, {FC} from "react";
import './input.scss';

interface InputProps {
    /** Type of input */
    type: string;

    /** Style of input (input, form)*/
    style: string;

    /** Text for label*/
    label?: string;

    /** Color input */
    color: string;

    /** Value of input */
    value: string | number;

    /** Error message */
    messageError?: string;

    /** Information about value in the input */
    placeholder?: string;

    /** Event on change */
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

    /** Name of input */
    name: string;

    /** If input is an error*/
    error: boolean;

    /** If input is disabled */
    disabled?: boolean;

    /** To hidden element */
    hidden?: boolean;

    /** If input take all space*/
    full?: boolean;

    pattern?: string;
}

const Input: FC<InputProps> = ({type= 'text', messageError, label, color = 'black', name, onChange, disabled= false, error= false, style='clear', value, placeholder= '', hidden= false, full = false, pattern}) => {

  const MessageError = error ? <span className={'error-message'}>{messageError}</span>:<></>;

  switch (true) {
    case style === "form":
      return <label className={` ${full ? 'full': null} ${error ? 'error': null} label-${color}`} hidden={hidden}>
        {label}
        <input pattern={pattern} className={`style-${style} ${error ? 'input-error': null}`} name={name} type={type} onChange={onChange} value={value} placeholder={placeholder} disabled={disabled} />
        {MessageError}
      </label>

    default:
      return <label className={` label-input ${full ? 'full': null} ${error ? 'error': null} label-${color}`} hidden={hidden}>
        {label}
        <input pattern={pattern} hidden={hidden} className={`style-${style} ${error ? 'input-error': null} text-${color}`} name={name} type={type} onChange={onChange} value={value} placeholder={placeholder} disabled={disabled} />
        {MessageError}

      </label>

    }
}

export default Input;
