import path from "path";
import {templateServiceFactory} from "../services/template-service";
import {FragmentResolver} from "../services/fragment-resolver";
import {FrontEndMetadata} from "../services/front-end.metadata";


export const renderCart = async (resolver: FragmentResolver, frontEndService: FrontEndMetadata) => {
    const templatePath = path.join(__dirname, '../template/cart.html');
    const templateService = await templateServiceFactory(templatePath, resolver, frontEndService)

    return templateService.render();
}
