import React, {ChangeEventHandler, FC, useEffect, useState} from 'react';
import './slider.scss'

interface SliderProps {
    onChange: Function;
    max: number;
    min: number;
    value: number
}

const Slider: FC<SliderProps> = ({ onChange, max, min, value }) => {

    const [localValue, setLocalValue] = useState<number>(0);

    useEffect(() => {
        const input = document.getElementById("myinput");
        if(!input) return;
        const handleInputChange = (e: any) => {
            const value = (e.target.value - e.target.min) / (e.target.max - e.target.min) * 100;
            e.target.style.background = `linear-gradient(to right, #E0FE5F 0%, #E0FE5F ${value}%, #fff ${value}%, white 100%)`;
        };

        // @ts-ignore
        input.addEventListener('input', handleInputChange);
        // @ts-ignore
        return () => input.removeEventListener('input', handleInputChange);

    }, []);


    const renderTicks = () => {
        const ticks = [];
        for (let i = 0; i <= max; i++) {
            ticks.push(
                <div hidden={localValue === i || i === 0 || i === 3} key={i} className="tick" style={{ left: `${i * 33.33}%` }}></div>
            );
        }
        return ticks;
    };

    /**
     * Change value for months
     * @param e
     */
    function changeValue(e: React.ChangeEvent<HTMLInputElement>) {
        const value = Number(e.target.value);
        setLocalValue(Number(e.target.value));

        switch (value) {
            case 0:
                onChange(0);
                break;
            case 1:
                onChange(1);
                break;
            case 2:
                onChange(3);
                break;
            case 3:
                onChange(6);
                break;
        }
    }

    return (
        <div className="slider-container">
            <input
                onChange={(e) => changeValue(e)}
                value={localValue}
                id={'myinput'}
                type="range"
                name="months"
                min={min}
                max={max}
            />
            {renderTicks()}
        </div>
    );
}

export default Slider;
