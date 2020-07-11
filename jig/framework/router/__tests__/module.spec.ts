import {RouterModule} from '../module';
import {configureJSDOM} from '../../../core/dom';
import {Platform} from '../../patform/platform';
import {Routes} from '../routes';

describe('RouterModule', () => {
  it('shows warning given a routes object', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);
    const dom = configureJSDOM(undefined, 'http://local/');
    new RouterModule(dom.window, Platform.browser(), new Routes([]));

    expect(spy.mock.calls[0][0]).toContain('Router module does not receives a Routes instance anymore');
  });
});
