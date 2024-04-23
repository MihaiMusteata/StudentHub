import { MaterialUIConfiguratorProps } from "./Layout";
import { FC } from "react";


const MaterialUIConfigurator: FC<MaterialUIConfiguratorProps> = ({ isOpen, setIsOpen }) => {

    const sidebarColor = (a: HTMLElement) => {
        const parent = document.querySelector(".nav-link.active");
        const color = a.getAttribute("data-color");

        if (parent) {
            parent.classList.remove(
              'bg-gradient-primary',
              'bg-gradient-dark',
              'bg-gradient-info',
              'bg-gradient-success',
              'bg-gradient-warning',
              'bg-gradient-danger'
            );
            parent.classList.add(`bg-gradient-${color}`);
        }
    }

    const darkMode = (el: HTMLInputElement): void => {
        console.log("Clicked on dark mode");
        const body = document.getElementsByTagName('body')[0];
        const hr = document.querySelectorAll('div:not(.sidenav) > hr');
        const hr_card = document.querySelectorAll('div:not(.bg-gradient-dark) hr');
        const text_btn = document.querySelectorAll('button:not(.btn) > .text-dark');
        const text_span = document.querySelectorAll('span.text-dark, .breadcrumb .text-dark');
        const text_span_white = document.querySelectorAll('span.text-white, .breadcrumb .text-white');
        const text_strong = document.querySelectorAll('strong.text-dark');
        const text_strong_white = document.querySelectorAll('strong.text-white');
        const text_nav_link = document.querySelectorAll('a.nav-link.text-dark');
        const text_nav_link_white = document.querySelectorAll('a.nav-link.text-white');
        const secondary = document.querySelectorAll('.text-secondary');
        const bg_gray_100 = document.querySelectorAll('.bg-gray-100');
        const bg_gray_600 = document.querySelectorAll('.bg-gray-600');
        const btn_text_dark = document.querySelectorAll('.btn.btn-link.text-dark, .material-icons.text-dark');
        const btn_text_white = document.querySelectorAll('.btn.btn-link.text-white, .material-icons.text-white');
        const card_border = document.querySelectorAll('.card.border');
        const card_border_dark = document.querySelectorAll('.card.border.border-dark');
        const svg = document.querySelectorAll('g');

        if (!el.checked) {
            body.classList.add('dark-version');
            for (let i = 0; i < hr.length; i++) {
                if (hr[i].classList.contains('dark')) {
                    hr[i].classList.remove('dark');
                    hr[i].classList.add('light');
                }
            }
            for (let i = 0; i < hr_card.length; i++) {
                if (hr_card[i].classList.contains('dark')) {
                    hr_card[i].classList.remove('dark');
                    hr_card[i].classList.add('light');
                }
            }
            for (let i = 0; i < text_btn.length; i++) {
                text_btn[i].classList.add('text-white');
                text_btn[i].classList.remove('text-dark');
            }
            for (let i = 0; i < text_span.length; i++) {
                text_span[i].classList.add('text-white');
                text_span[i].classList.remove('text-dark');
            }
            for (let i = 0; i < text_span_white.length; i++) {
                text_span_white[i].classList.add('text-dark');
                text_span_white[i].classList.remove('text-white');
            }
            for (let i = 0; i < text_strong.length; i++) {
                text_strong[i].classList.add('text-white');
                text_strong[i].classList.remove('text-dark');
            }
            for (let i = 0; i < text_strong_white.length; i++) {
                text_strong_white[i].classList.add('text-dark');
                text_strong_white[i].classList.remove('text-white');
            }
            for (let i = 0; i < text_nav_link.length; i++) {
                text_nav_link[i].classList.add('text-white');
                text_nav_link[i].classList.remove('text-dark');
            }
            for (let i = 0; i < text_nav_link_white.length; i++) {
                text_nav_link_white[i].classList.add('text-dark');
                text_nav_link_white[i].classList.remove('text-white');
            }
            for (let i = 0; i < secondary.length; i++) {
                secondary[i].classList.add('text-white');
                secondary[i].classList.remove('text-dark');
            }
            for (let i = 0; i < bg_gray_100.length; i++) {
                bg_gray_100[i].classList.add('bg-gray-800');
                bg_gray_100[i].classList.remove('bg-gray-100');
            }
            for (let i = 0; i < bg_gray_600.length; i++) {
                bg_gray_600[i].classList.add('bg-gray-700');
                bg_gray_600[i].classList.remove('bg-gray-600');
            }
            for (let i = 0; i < btn_text_dark.length; i++) {
                btn_text_dark[i].classList.add('text-white');
                btn_text_dark[i].classList.remove('text-dark');
            }
            for (let i = 0; i < btn_text_white.length; i++) {
                btn_text_white[i].classList.add('text-dark');
                btn_text_white[i].classList.remove('text-white');
            }
            for (let i = 0; i < card_border.length; i++) {
                card_border[i].classList.add('border-dark');
            }
            for (let i = 0; i < card_border_dark.length; i++) {
                card_border_dark[i].classList.remove('border-dark');
            }
            for (let i = 0; i < svg.length; i++) {
                svg[i].classList.add('text-white');
            }


        } else {
            body.classList.remove('dark-version');
            for (let i = 0; i < hr.length; i++) {
                if (hr[i].classList.contains('light')) {
                    hr[i].classList.add('dark');
                    hr[i].classList.remove('light');
                }
            }
            for (let i = 0; i < hr_card.length; i++) {
                if (hr_card[i].classList.contains('light')) {
                    hr_card[i].classList.add('dark');
                    hr_card[i].classList.remove('light');
                }
            }
            for (let i = 0; i < text_btn.length; i++) {
                text_btn[i].classList.add('text-dark');
                text_btn[i].classList.remove('text-white');
            }
            for (let i = 0; i < text_span.length; i++) {
                text_span[i].classList.add('text-dark');
                text_span[i].classList.remove('text-white');
            }
            for (let i = 0; i < text_span_white.length; i++) {
                text_span_white[i].classList.add('text-white');
                text_span_white[i].classList.remove('text-dark');
            }
            for (let i = 0; i < text_strong.length; i++) {
                text_strong[i].classList.add('text-dark');
                text_strong[i].classList.remove('text-white');
            }
            for (let i = 0; i < text_strong_white.length; i++) {
                text_strong_white[i].classList.add('text-white');
                text_strong_white[i].classList.remove('text-dark');
            }
            for (let i = 0; i < text_nav_link.length; i++) {
                text_nav_link[i].classList.add('text-dark');
                text_nav_link[i].classList.remove('text-white');
            }
            for (let i = 0; i < text_nav_link_white.length; i++) {
                text_nav_link_white[i].classList.add('text-white');
                text_nav_link_white[i].classList.remove('text-dark');
            }
            for (let i = 0; i < secondary.length; i++) {
                secondary[i].classList.add('text-dark');
                secondary[i].classList.remove('text-white');
            }
            for (let i = 0; i < bg_gray_100.length; i++) {
                bg_gray_100[i].classList.add('bg-gray-100');
                bg_gray_100[i].classList.remove('bg-gray-800');
            }
            for (let i = 0; i < bg_gray_600.length; i++) {
                bg_gray_600[i].classList.add('bg-gray-600');
                bg_gray_600[i].classList.remove('bg-gray-700');
            }
            for (let i = 0; i < btn_text_dark.length; i++) {
                btn_text_dark[i].classList.add('text-dark');
                btn_text_dark[i].classList.remove('text-white');
            }
            for (let i = 0; i < btn_text_white.length; i++) {
                btn_text_white[i].classList.add('text-white');
                btn_text_white[i].classList.remove('text-dark');
            }
            for (let i = 0; i < card_border.length; i++) {
                card_border[i].classList.remove('border-dark');
            }
            for (let i = 0; i < card_border_dark.length; i++) {
                card_border_dark[i].classList.add('border-dark');
            }
            for (let i = 0; i < svg.length; i++) {
                svg[i].classList.remove('text-white');
            }


        }
    };

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
                  <a className="switch-trigger background-color">
                      <div className="badge-colors my-2 text-start">
                          <span className="badge filter bg-gradient-primary active" data-color="primary" onClick={(e) => sidebarColor(e.target as HTMLElement)}></span>
                          <span className="badge filter bg-gradient-dark" data-color="dark" onClick={(e) => sidebarColor(e.target as HTMLElement)}></span>
                          <span className="badge filter bg-gradient-info" data-color="info" onClick={(e) => sidebarColor(e.target as HTMLElement)}></span>
                          <span className="badge filter bg-gradient-success" data-color="success" onClick={(e) => sidebarColor(e.target as HTMLElement)}></span>
                          <span className="badge filter bg-gradient-warning" data-color="warning" onClick={(e) => sidebarColor(e.target as HTMLElement)}></span>
                          <span className="badge filter bg-gradient-danger" data-color="danger" onClick={(e) => sidebarColor(e.target as HTMLElement)}></span>
                      </div>
                  </a>
                  <div className="mt-2 d-flex">
                      <h6 className="mb-0">Light / Dark</h6>
                      <div className="form-check form-switch ps-0 ms-auto my-auto">
                          <input className="form-check-input mt-1 ms-auto" type="checkbox" id="dark-version" onClick={(e) => darkMode(e.target as HTMLInputElement)} />
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
}

export default MaterialUIConfigurator;