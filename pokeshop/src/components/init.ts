import '../../../jigjoy/src/core/register';
import '../../../jigjoy/src/fragments/browser/browser-fragment-module'
import "../../../jigjoy/src/components/browser/browser-rehydrate-service"

import {app} from "./app";
import {createContainer} from "../../../jigjoy/src/browser/di";
import {DocumentInjectionToken, WindowInjectionToken} from "../../../jigjoy/src/core/dom";
import {registerContextualDependencies} from "../../../jigjoy/src/core/di";

const requestContainer = createContainer();

requestContainer.register(DocumentInjectionToken, {useValue: document});
requestContainer.register(WindowInjectionToken, {useValue: window});

registerContextualDependencies(requestContainer);

app.registerCustomElementClass(window as any, requestContainer);
