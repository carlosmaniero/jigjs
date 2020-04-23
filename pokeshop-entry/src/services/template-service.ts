import {JSDOM} from 'jsdom';
import {FragmentResolver} from "./fragment-resolver";
import {FrontEndDIService} from "./front-end-d-i.service";
import {FrontEndMetadata} from "./front-end.metadata";
import fs from "fs";
import {registerMicroFrontEndComponent} from "../components/micro-front-ends/MicroFrontEndComponent";

class TemplateService {
    constructor(
        private readonly dom: JSDOM,
        private readonly fragmentResolver: FragmentResolver,
        private readonly frontEndService: FrontEndMetadata,
        private readonly frontEndDIService: FrontEndDIService,
    ) {}

    async render() {
        this.appendMetadata();

        const waitForRenderPromise = this.waitUntilAllFragmentsAreResolved();

        registerMicroFrontEndComponent(this.dom.window, this.fragmentResolver);

        await waitForRenderPromise;

        return this.dom.serialize();
    }

    private waitUntilAllFragmentsAreResolved() {
        return new Promise((resolve) => {
            let waitingFor = Array
                .apply(null, this.dom.window.document.querySelectorAll('front-end-fragment'))
                .map((element) => element.id);

            this.dom.window.document.querySelectorAll('front-end-fragment').forEach((fragment: any) => {
                fragment.onFinish = (el, res) => {
                    if (res.eventDependencies) {
                        this.frontEndDIService.injectDependencyOfEvent(res.eventDependencies);
                    }

                    waitingFor = waitingFor.filter((id) => el.id === id);

                    if (waitingFor.length === 0) {
                        resolve();
                    }
                }
            })
        });
    }

    private appendMetadata() {
        const script = this.dom.window.document.createElement('script');

        script.id = '__micro_front_end_metadata__';
        script.type = 'application/json';
        script.textContent = JSON.stringify(this.frontEndService.getEventMap());

        this.dom.window.document.body.appendChild(script)
    }
}

export const templateServiceFactory = async (templatePath: string, fragmentResolver: FragmentResolver, frontEndService: FrontEndMetadata): Promise<TemplateService> => {
    const html: string = await new Promise((resolve => {
        fs.readFile(templatePath, 'utf8', (err, data) => {
            resolve(data);
        });
    }));

    const jsdom = new JSDOM(html);

    return new TemplateService(
        jsdom,
        fragmentResolver,
        frontEndService,
        new FrontEndDIService(frontEndService, jsdom.window.document)
    )
}
