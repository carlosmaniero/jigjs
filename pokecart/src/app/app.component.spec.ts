import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import { render } from '@testing-library/angular'


describe('AppComponent', () => {
  it('renders title', async () => {
    const component = await render(AppComponent, {
      imports: [
        RouterTestingModule
      ]
    });
    expect(component.queryByText('Welcome to PokéShop!')).not.toBeNull();
  });
});
