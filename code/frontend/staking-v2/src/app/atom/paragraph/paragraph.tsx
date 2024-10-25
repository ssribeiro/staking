import React, {FC} from 'react';
import './paragraph.scss';

interface ParagraphProps {
    /** Text to display */
    text: string|undefined;

    /** Color of text */
    color?: string;

    /** Size of text */
    size?: string

    /** weight of font */
    weight?: string;

    /** Style of font */
    styleFont?: string;

}

const Paragraph: FC<ParagraphProps> = ({text, color='white', size='medium', weight= 'regular', styleFont}) => {
    return (
        <>
            <p className={`paragraph paragraph-style ${color} ${size} text-${weight} ${styleFont}`}>{text}</p>
        </>
    )
}

export default Paragraph;
