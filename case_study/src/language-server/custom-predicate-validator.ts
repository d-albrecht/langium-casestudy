import { ValidationAcceptor, ValidationChecks, ValidationRegistry } from 'langium';
import { CustomPredicateAstType, Person } from './generated/ast';
import type { CustomPredicateServices } from './custom-predicate-module';

/**
 * Registry for validation checks.
 */
export class CustomPredicateValidationRegistry extends ValidationRegistry {
    constructor(services: CustomPredicateServices) {
        super(services);
        const validator = services.validation.CustomPredicateValidator;
        const checks: ValidationChecks<CustomPredicateAstType> = {
            Person: validator.checkPersonStartsWithCapital
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class CustomPredicateValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
