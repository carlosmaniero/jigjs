import '../../../jigjoy/src/core/register';
import '../../../jigjoy/src/fragments/browser/browser-fragment-module'
import {app} from "./app";
import {createContainer} from "../../../jigjoy/src/browser/di";

app.registerCustomElementClass(window as any, createContainer());
