import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

  getTitleText(): Promise<string> {
    return element(by.css('h1')).getText() as Promise<string>;
  }

  getCartCount(): Promise<number> {
    return element(by.id('fragment-cart')).getText()
      .then((value) => parseInt(value.replace( /^\D+/g, ''))) as Promise<number>;
  }

  getFirstPokemon(): Promise<string> {
    return element(by.css('#fragment-catalog h3')).getText() as Promise<string>;
  }
}
