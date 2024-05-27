import React, { FC } from 'react';
import './title.scss'

interface TitleProps {
    /** Type title 1 = h1,... */
    level?: number;

    /** Text to display */
    text: string;

    /** Size of title large, medium, small */
    size?: string;

    /** Color of title */
    color?: string

    /** Weight of font */
    weight?: string;

    /** Style of font */
    styleFont?: string;

    /** if letters is Extended*/
    extended?: boolean;
}

const Title: FC<TitleProps> = ({level= 1,text='Title', size='medium', color='dark', weight= 'regular', styleFont='normal', extended = false}) => {

    // Define the type of balise H with JSX.IntrinsicElements
    const Level = `h${level}`as keyof JSX.IntrinsicElements;

    return (
        <>
            <Level className={`title title-style ${size} ${color} style-font-${styleFont} text-${weight} ${extended ? 'extended' : ''}`}>{text}</Level>
        </>
    )
}

export default Title;
