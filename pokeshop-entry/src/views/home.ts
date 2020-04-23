import path from "path";
import {templateServiceFactory} from "../services/template-service";
import {FragmentResolver} from "../services/fragment-resolver";
import {FrontEndMetadataService} from "../services/front-end-metadata.service";


export const renderHome = async (resolver: FragmentResolver, frontEndService: FrontEndMetadataService) => {
    const templatePath = path.join(__dirname, '../template/index.html');
    const templateService = await templateServiceFactory(templatePath, resolver, frontEndService)

    return templateService.render();
}
