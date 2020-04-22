import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('displays welcome message', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('Welcome to PokéShop!');
  });

  it('fetches the cart cart service', () => {
    page.navigateTo();
    expect(page.getCartCount()).toEqual(0);
  });

  it('fetches the catalog service', () => {
    page.navigateTo();
    expect(page.getFirstPokemon()).toEqual('BULBASAUR');
  })

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
