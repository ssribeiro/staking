import React, {FC} from "react";
import './footer.scss';
import Paragraph from "../../atom/paragraph/paragraph";

const Footer: FC<{}> = ({ }) => {
    return (
        <footer>
            <Paragraph text={'© Open Custody Protocol, All Rights Reserved'} size={'medium'} weight={'thin'} color={'dark'} />
        </footer>
    )
}

export default Footer