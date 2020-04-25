export const registerHeaderComponent = (window) => {
    class Header extends window.HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.innerHTML = `
                <style>
                    #main-header {
                        background: #544F73;
                        position: fixed;
                        top: 0;
                        width: 100%;
                        left: 0;
                        display: flex;
                        height: 60px;
                        align-items: center;
                        justify-content: space-between;
                        z-index: 1;
                        box-sizing: border-box;
                        padding: 0 60px;
                        border-bottom: 5px solid rgba(255, 255, 255, 0.02);
                        box-shadow: 0px 0px 6px rgba(0, 0, 0, 1);
                    }
            
                    #main-header h1 {
                        color: white;
                        font-family: sans-serif;
                        margin: 0;
                        font-size: 22px;
                    }
            
                    @media only screen and (max-width: 600px) {
                        #main-header h1 {
                            font-size: 16px;
                        }
            
                        #main-header {
                            padding: 0 20px;
                        }
                    }
                </style>
                <header id="main-header">
                    <h1>Pokémon Shop!</h1>
            
                    <div id="cart-container">
                        <front-end-fragment
                                async="true"
                                id="cart-counter-fragment"
                                url="http://localhost:3001/">
                        </front-end-fragment>
                    </div>
                </header>
            `
        }
    }

    window.customElements.define('header-component', Header);
}
