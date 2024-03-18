import { MaterialUIConfiguratorProps } from "./Layout";
import { FC } from "react";


const MaterialUIConfigurator: FC<MaterialUIConfiguratorProps> = ({ isOpen, setIsOpen }) => {
    return (
        <div className={`fixed-plugin ${isOpen ? 'show' : ''}`}>
            <div className="card shadow-lg">
                <div className="card-header pb-0 pt-3">
                    <div className="float-start">
                        <h5 className="mt-3 mb-0">Material UI Configurator</h5>
                        <p>See our dashboard options.</p>
                    </div>
                    <div className="float-end mt-4">
                        <button className="btn btn-link text-dark p-0 fixed-plugin-close-button" onClick={() => setIsOpen(false)}>
                            <i className="material-icons">clear</i>
                        </button>
                    </div>
                </div>
                <hr className="horizontal dark my-1" />
                <div className="card-body pt-sm-3 pt-0">
                    <div>
                        <h6 className="mb-0">Sidebar Colors</h6>
                    </div>
                    <a href="/NotImplemented" className="switch-trigger background-color">
                        <div className="badge-colors my-2 text-start">
                            <span className="badge filter bg-gradient-primary active" data-color="primary" onClick={() => sidebarColor(this)}></span>
                            <span className="badge filter bg-gradient-dark" data-color="dark" onClick={() => sidebarColor(this)}></span>
                            <span className="badge filter bg-gradient-info" data-color="info" onClick={() => sidebarColor(this)}></span>
                            <span className="badge filter bg-gradient-success" data-color="success" onClick={() => sidebarColor(this)}></span>
                            <span className="badge filter bg-gradient-warning" data-color="warning" onClick={() => sidebarColor(this)}></span>
                            <span className="badge filter bg-gradient-danger" data-color="danger" onClick={() => sidebarColor(this)}></span>
                        </div>
                    </a>
                    {/* Sidenav Type */}
                    <div className="mt-3">
                        <h6 className="mb-0">Sidenav Type</h6>
                        <p className="text-sm">Choose between 2 different sidenav types.</p>
                    </div>
                    <div className="d-flex">
                        <button className="btn bg-gradient-dark px-3 mb-2 active" data-class="bg-gradient-dark" onClick={() => sidebarType(this)}>Dark</button>
                        <button className="btn bg-gradient-dark px-3 mb-2 ms-2" data-class="bg-transparent" onClick={() => sidebarType(this)}>Transparent</button>
                        <button className="btn bg-gradient-dark px-3 mb-2 ms-2" data-class="bg-white" onClick={() => sidebarType(this)}>White</button>
                    </div>
                    <p className="text-sm d-xl-none d-block mt-2">You can change the sidenav type just on desktop view.</p>
                    {/* Navbar Fixed */}
                    <div className="mt-3 d-flex">
                        <h6 className="mb-0">Navbar Fixed</h6>
                        <div className="form-check form-switch ps-0 ms-auto my-auto">
                            <input className="form-check-input mt-1 ms-auto" type="checkbox" id="navbarFixed" onClick={() => navbarFixed(this)} />
                        </div>
                    </div>
                    <hr className="horizontal dark my-3" />
                    <div className="mt-2 d-flex">
                        <h6 className="mb-0">Light / Dark</h6>
                        <div className="form-check form-switch ps-0 ms-auto my-auto">
                            <input className="form-check-input mt-1 ms-auto" type="checkbox" id="dark-version" onClick={() => darkMode(this)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MaterialUIConfigurator;