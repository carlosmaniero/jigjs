import {JSDOM} from 'jsdom';
import {FragmentResolver} from "./fragment-resolver";
import {FrontEndDiService} from "./front-end-di.service";
import {FrontEndMetadata, MICRO_FRONT_END_METADATA_ID} from "./front-end.metadata";
import fs from "fs";
import {registerMicroFrontEndComponent} from "../components/micro-front-ends/micro-front-end.component";


class TemplateService {
    constructor(
        private readonly dom: JSDOM,
        private readonly fragmentResolver: FragmentResolver,
        private readonly frontEndService: FrontEndMetadata,
        private readonly frontEndDIService: FrontEndDiService,
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
                fragment.onFinish = (el) => {
                    waitingFor = waitingFor.filter((id) => el.id !== id);

                    if (waitingFor.length === 0) {
                        resolve();
                    }
                }
            })
        });
    }

    private appendMetadata() {
        this.dom.window.document.body.appendChild(
            this.frontEndService.createScript(this.dom.window.document)
        )
    }
}

function processContext(html: string, renderContext: Record<string, string>) {
    let processedHtml = html;

    for (let key in renderContext) {
        const templateReplacement = `{${key}}`;
        processedHtml = processedHtml.replace(new RegExp(templateReplacement, 'g'), renderContext[key])
    }

    return processedHtml
}

export const templateServiceFactory = async (
    templatePath: string,
    fragmentResolver: FragmentResolver,
    frontEndService: FrontEndMetadata,
    renderContext: Record<string, string> = {}
): Promise<TemplateService> => {
    const html: string = await new Promise((resolve => {
        fs.readFile(templatePath, 'utf8', (err, data) => {
            resolve(data);
        });
    }));

    const jsdom = new JSDOM(processContext(html, renderContext));

    return new TemplateService(
        jsdom,
        fragmentResolver,
        frontEndService,
        new FrontEndDiService(frontEndService, jsdom.window.document)
    )
}
