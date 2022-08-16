import {
    createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext, inject,
    LangiumServices, LangiumSharedServices, Module, PartialLangiumServices
} from 'langium';
import { CustomPredicateGeneratedModule, CustomPredicateGeneratedSharedModule } from './generated/module';
import { CustomPredicateValidationRegistry, CustomPredicateValidator } from './custom-predicate-validator';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type CustomPredicateAddedServices = {
    validation: {
        CustomPredicateValidator: CustomPredicateValidator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type CustomPredicateServices = LangiumServices & CustomPredicateAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const CustomPredicateModule: Module<CustomPredicateServices, PartialLangiumServices & CustomPredicateAddedServices> = {
    validation: {
        ValidationRegistry: (services) => new CustomPredicateValidationRegistry(services),
        CustomPredicateValidator: () => new CustomPredicateValidator()
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createCustomPredicateServices(context?: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    CustomPredicate: CustomPredicateServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        CustomPredicateGeneratedSharedModule
    );
    const CustomPredicate = inject(
        createDefaultModule({ shared }),
        CustomPredicateGeneratedModule,
        CustomPredicateModule
    );
    shared.ServiceRegistry.register(CustomPredicate);
    return { shared, CustomPredicate };
}
