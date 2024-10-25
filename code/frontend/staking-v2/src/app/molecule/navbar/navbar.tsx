import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../atom/button/button";
import Image from "../../atom/image/image";
import { addressShortener } from "../../services/helper.service";
import {
    createWeb3Modal,
    useWeb3Modal,
    useWeb3ModalAccount,
    defaultConfig,
    useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import "./navbar.scss";
import {
    NETWORK,
    WALLET_CONNECT_ID,
    WALLET_CONNECT_METADATA,
    WALLET_CONNECT_NETWORK,
} from "../../constants/constants";

// Initialize the wallet connect modal
createWeb3Modal({
    ethersConfig: defaultConfig({ metadata: WALLET_CONNECT_METADATA }),
    chains: [WALLET_CONNECT_NETWORK[NETWORK]],
    projectId: WALLET_CONNECT_ID,
    enableAnalytics: true,
});
const { open, close } = useWeb3Modal();

const NavBar: FC<{}> = ({}) => {
    /** Wallet Address **/
    const { address, chainId, isConnected } = useWeb3ModalAccount();

    /** For navigation */
    const navigate = useNavigate();

    const [menuMobile, setMenuMobile] = useState<boolean>(false);

    const [isMobile, setIsMobile] = useState<boolean>(false);

    /**
     * USE EFFECT TO INIT INFO USER
     */
    useEffect(() => {
        setIsMobile(window.screen.width <= 1024);
    });

    /**
     * USE EFFECT TO INIT INFO USER
     */
    useEffect(() => {
        if (menuMobile) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "scroll";
        }
    }, [menuMobile]);

    /**
     * Function to navigate
     * @param name of page
     */
    function navigateTo(name: string) {
        navigate(`/${name.toLowerCase()}`);
    }

    return (
        <>
            <nav
                className={`navbar-component ${menuMobile ? "open" : "close"}`}
            >
                <div className={"navbar-logo"} onClick={() => navigateTo("")}>
                    <Image
                        path={`images/logo-open-custody-protocol.svg`}
                        alt={`logo`}
                        className="navbar-logo"
                    />
                    <Image
                        path={`images/icon/icon-menu-dark.svg`}
                        size={"large"}
                        alt={`menu`}
                        className="navbar-logo"
                        click={() => setMenuMobile(!menuMobile)}
                    />
                </div>

                <div className={"navbar-connect"}>
                    <Button
                        color={"light"}
                        styleButton="primary"
                        text={"DOCS"}
                        click={() =>
                            window.open(
                                "https://docs.opencustody.org/staking-guide",
                                "_blank"
                            )
                        }
                    ></Button>
                    <Button
                        color="dark"
                        styleButton="primary"
                        text={
                            isConnected
                                ? addressShortener(address)
                                : "CONNECT WALLET"
                        }
                        click={() => open()}
                    ></Button>
                </div>
            </nav>
        </>
    );
};

export default NavBar;
