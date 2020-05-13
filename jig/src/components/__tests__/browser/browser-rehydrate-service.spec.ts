import {JSDOM} from "jsdom";
import {ServerRehydrateService} from "../../server/server-rehydrate-service";
import {ServerFlushRehydrateState} from "../../server/server-flush-rehydrate-state";
import {BrowserRehydrateService} from "../../browser/browser-rehydrate-service";

describe('Browser Rehydrate Service', () => {
    it('returns the object encoded into the dom by the server flush', () => {
        const dom = new JSDOM();
        const serverRehydrateService = new ServerRehydrateService();

        const serverFlushRehydrateState: ServerFlushRehydrateState =
            new ServerFlushRehydrateState(serverRehydrateService, dom.window.document);

        serverRehydrateService.updateContext('0', {a: 'b'});
        serverFlushRehydrateState.beforeFlushRequest();

        expect(new BrowserRehydrateService(dom.window.document).getContext('0'))
            .toEqual({a: 'b'});
    });
})
