import {component, html} from 'jigjs/components';

@component()
export class MyPage {
  constructor(private readonly title: string) {
  }

  render() {
    return html`
            <style>
                main {
                    font-family: 'Mandali', sans-serif;
                    text-align: center;
                }
            </style>
            <main>
                <img src="/logo.png" alt="Jig.js Logo" width="300px">
                <h1>${this.title}</h1>
                
                <p>This page takes a while to render on purpose.</p>
                <p>You can see into the <strong>app.ts</strong> How to handle async operations in router.</p>
            </main>
        `;
  }
}
