import { ReactNode } from "react";
import Sidenav from "./Sidenav";
import Navbar from "./Navbar";
import {useState} from "react";
import MaterialUIConfigurator from "./Material-UI-Configurator";
import { User } from '../../scripts/user'

export interface MaterialUIConfiguratorProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}
interface LayoutProps {
    children: ReactNode;
    user: User;
    setUser: (user: User) => void;
}
const Layout = ({ children, user, setUser }: LayoutProps) => {
    const [isOpenMaterialUIConfigurator, setIsOpenMaterialUIConfigurator] = useState<boolean>(false);

    return (
        <>
            <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3   bg-gradient-dark" id="sidenav-main">
                <Sidenav user={user} setUser={setUser} />
            </aside>

            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <nav className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl" id="navbarBlur" data-scroll="true">
                    <Navbar isOpen={isOpenMaterialUIConfigurator} setIsOpen={setIsOpenMaterialUIConfigurator} />
                </nav>
                <MaterialUIConfigurator isOpen={isOpenMaterialUIConfigurator} setIsOpen={setIsOpenMaterialUIConfigurator} />
                {children}
            </main>
        </>
    );
}

export default Layout;