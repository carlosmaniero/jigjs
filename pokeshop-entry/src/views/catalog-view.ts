import path from "path";
import {CustomElementRegistration, templateServiceFactory} from "../services/template-service";
import {FragmentResolver} from "../services/fragment-resolver";
import {FrontEndMetadata} from "../services/front-end.metadata";


export const renderCatalog = async (resolver: FragmentResolver, frontEndService: FrontEndMetadata, pageNumber: string = '1', customElementRegistrations: CustomElementRegistration[]) => {
    const templatePath = path.join(__dirname, '../template/index.html');
    const templateService = await templateServiceFactory(
        templatePath, resolver, frontEndService,
        {currentPageNumber: pageNumber},
        customElementRegistrations
    )

    return templateService.render();
}

export const renderPokemon = async (resolver: FragmentResolver, frontEndService: FrontEndMetadata, pokemonNumber, customElementRegistrations: CustomElementRegistration[]) => {
    const templatePath = path.join(__dirname, '../template/pokemon.html');
    const templateService = await templateServiceFactory(
        templatePath, resolver, frontEndService,
        {number: pokemonNumber},
        customElementRegistrations
    )

    return templateService.render();
}
