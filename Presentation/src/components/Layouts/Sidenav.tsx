import { FC } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Navbar } from 'react-bootstrap';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { ListItemIcon } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { User } from '../../scripts/user';
import { Link } from 'react-router-dom';

interface SidenavProps {
    user: User;
    setUser: (user: User) => void;
}
const Sidenav: FC<SidenavProps> = ({ user }) => {
    const navItem = (icon: JSX.Element, text: string, link: string) => {
        return (
            <li className="nav-item">
                <Link to={link} className="nav-link text-white">
                    <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                        <ListItemIcon style={{ color: 'white' }} >
                            {icon}
                        </ListItemIcon>
                    </div>
                    <span className="nav-link-text ms-1">{text}</span>
                </Link>
            </li>
        );
    };
    const renderSidebarItems = () => {
        switch (user.role) {
            case "Admin":
                return (
                    <>
                        {navItem(<PeopleAltIcon />, "Users", "/users")}
                        {navItem(<PeopleAltIcon />, "Students", "/students")}
                        {navItem(<PeopleAltIcon />, "Teachers", "/teachers")}
                    </>
                );
            case "Teacher":
                return (
                    <>
                        <li className="nav-item">
                            <a className="nav-link text-white" href="../pages/sign-in.html">
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <ListItemIcon>
                                        <PeopleAltIcon style={{ color: 'white' }} />
                                    </ListItemIcon>
                                </div>
                                <span className="nav-link-text ms-1">Teachers Case</span>
                            </a>
                        </li>
                    </>
                );
            case "Student":
                return (
                    <>
                        <li className="nav-item">
                            <a className="nav-link text-white" href="../pages/sign-in.html">
                                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                    <ListItemIcon>
                                        <PeopleAltIcon style={{ color: 'white' }} />
                                    </ListItemIcon>
                                </div>
                                <span className="nav-link-text ms-1">Students Case</span>
                            </a>
                        </li>
                    </>
                );
            default:
                // console.log("Redirecting to login");
                // return <Navigate to="/login" />;
                return null;
        }
    };
    return (
        <>
            <div className="sidenav-header">
                <i className="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
                <Navbar.Brand className="d-flex align-items-center">
                    <span className="me-auto font-weight-bold text-white">Menu</span>
                    <MenuIcon className="text-white" />
                </Navbar.Brand>
            </div>
            <hr className="horizontal light mt-0 mb-2" />
            <div className="collapse navbar-collapse w-auto" id="sidenav-collapse-main">
                <ul className="navbar-nav">
                    <li className="nav-item mt-3">
                        <h6 className="ps-4 ms-2 text-uppercase text-xs text-white font-weight-bolder opacity-8">Account Management</h6>
                    </li>
                    {renderSidebarItems()}
                    <li className="nav-item mt-3">
                        <h6 className="ps-4 ms-2 text-uppercase text-xs text-white font-weight-bolder opacity-8">Account pages</h6>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white" href="../pages/sign-in.html">
                            <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                <ListItemIcon>
                                    <AccountCircleIcon style={{ color: 'white' }} />
                                </ListItemIcon>
                            </div>
                            <span className="nav-link-text ms-1">Profile</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white" href="../pages/sign-in.html">
                            <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                <ListItemIcon>
                                    <LogoutIcon style={{ color: 'white' }} />
                                </ListItemIcon>
                            </div>
                            <span className="nav-link-text ms-1">Logout</span>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="sidenav-footer position-absolute w-100 bottom-0">
                <div className="mx-3">
                    <a className="btn btn-outline-primary mt-4 w-100" href="https://www.creative-tim.com/learning-lab/bootstrap/overview/material-dashboard?ref=sidebarfree" type="button">Documentation</a>
                </div>
            </div>
        </>
    );
};

export default Sidenav;
