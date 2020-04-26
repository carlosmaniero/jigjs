import path from "path";
import {templateServiceFactory} from "../services/template-service";
import {FragmentResolver} from "../services/fragment-resolver";
import {FrontEndMetadata} from "../services/front-end.metadata";
import {registerHeaderComponent} from "../components/layout/header.component";


export const renderCatalog = async (resolver: FragmentResolver, frontEndService: FrontEndMetadata, pageNumber: string = '1') => {
    const templatePath = path.join(__dirname, '../template/index.html');
    const templateService = await templateServiceFactory(
        templatePath, resolver, frontEndService,
        {currentPageNumber: pageNumber},
        [registerHeaderComponent]
    )

    return templateService.render();
}
