import {ServerFlushRehydrateState} from "../../server/server-flush-rehydrate-state";
import {ServerRehydrateService} from "../../server/server-rehydrate-service";
import {JSDOM} from 'jsdom';

describe('Server Flush Rehydrate State', () => {
    it('appends the state into the body', () => {
        const dom = new JSDOM();
        const serverRehydrateService = new ServerRehydrateService();

        const serverFlushRehydrateState: ServerFlushRehydrateState =
            new ServerFlushRehydrateState(serverRehydrateService, dom.window.document);

        serverRehydrateService.updateContext('0', {a: 'b'});

        serverFlushRehydrateState.beforeFlushRequest();

        expect(dom.window.document.querySelector('script#jigjoy-rehydrate-context').innerHTML)
            .toBe(encodeURI(JSON.stringify(serverRehydrateService.contextMap)));
    })
});
