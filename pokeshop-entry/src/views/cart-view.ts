import path from "path";
import {CustomElementRegistration, templateServiceFactory} from "../services/template-service";
import {FragmentResolver} from "../services/fragment-resolver";
import {FrontEndMetadata} from "../services/front-end.metadata";


export const renderCart = async (resolver: FragmentResolver, frontEndService: FrontEndMetadata, customElementRegistrations: CustomElementRegistration[]) => {
    const templatePath = path.join(__dirname, '../template/cart.html');
    const templateService = await templateServiceFactory(
        templatePath, resolver, frontEndService, {},
        customElementRegistrations
    )

    return templateService.render();
}
