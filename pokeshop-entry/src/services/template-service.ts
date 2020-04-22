import {JSDOM} from 'jsdom';
import {FragmentResolver} from "./fragment-resolver";
import {FrontEndDIService} from "./front-end-d-i.service";
import {FrontEndService} from "./front-end.service";
import fs from "fs";
import {registerMicroFrontEndComponent} from "../components/micro-front-ends/MicroFrontEndComponent";

class TemplateService {
    constructor(
        private readonly dom: JSDOM,
        private readonly fragmentResolver: FragmentResolver,
        private readonly frontEndDIService: FrontEndDIService,
    ) {}

    async render() {
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
}

export const templateServiceFactory = async (templatePath: string, fragmentResolver: FragmentResolver, frontEndService: FrontEndService): Promise<TemplateService> => {
    const html: string = await new Promise((resolve => {
        fs.readFile(templatePath, 'utf8', (err, data) => {
            resolve(data);
        });
    }));

    const jsdom = new JSDOM(html);

    return new TemplateService(
        jsdom,
        fragmentResolver,
        new FrontEndDIService(frontEndService, jsdom.window.document)
    )
}
