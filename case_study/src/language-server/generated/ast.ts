/******************************************************************************
 * This file was generated by langium-cli 0.4.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { AstNode, AstReflection, isAstNode, TypeMetaData } from 'langium';

export type Predicate = Or;

export const Predicate = 'Predicate';

export function isPredicate(item: unknown): item is Predicate {
    return reflection.isInstance(item, Predicate);
}

export type Rpred = Group;

export const Rpred = 'Rpred';

export function isRpred(item: unknown): item is Rpred {
    return reflection.isInstance(item, Rpred);
}

export type Rule = Brule | Nrule | RCrule | Rrule | Trule;

export const Rule = 'Rule';

export function isRule(item: unknown): item is Rule {
    return reflection.isInstance(item, Rule);
}

export interface And extends AstNode {
    readonly $container: Or;
    inner: Array<Xor>
}

export const And = 'And';

export function isAnd(item: unknown): item is And {
    return reflection.isInstance(item, And);
}

export interface Bid extends AstNode {
    readonly $container: Bind | Nval | Tval;
    id: number
}

export const Bid = 'Bid';

export function isBid(item: unknown): item is Bid {
    return reflection.isInstance(item, Bid);
}

export interface Bind extends Binds {
    readonly $container: Binds | Brule;
    field: number | string
    id: Bid
}

export const Bind = 'Bind';

export function isBind(item: unknown): item is Bind {
    return reflection.isInstance(item, Bind);
}

export interface Binds extends AstNode {
    readonly $container: Binds | Brule;
    fields: Array<Bind>
}

export const Binds = 'Binds';

export function isBinds(item: unknown): item is Binds {
    return reflection.isInstance(item, Binds);
}

export interface Brule extends AstNode {
    readonly $container: Brule | Not | RCrule | Rrule | Xor;
    binds: Binds
    group: Group
}

export const Brule = 'Brule';

export function isBrule(item: unknown): item is Brule {
    return reflection.isInstance(item, Brule);
}

export interface Filter extends AstNode {
    rules: Array<Predicate>
}

export const Filter = 'Filter';

export function isFilter(item: unknown): item is Filter {
    return reflection.isInstance(item, Filter);
}

export interface Group extends Not {
    readonly $container: Brule | Not | RCrule | Rrule | Xor;
    rule: Or
}

export const Group = 'Group';

export function isGroup(item: unknown): item is Group {
    return reflection.isInstance(item, Group);
}

export interface Int extends AstNode {
    readonly $container: Nval;
    sign: boolean
    val: number
}

export const Int = 'Int';

export function isInt(item: unknown): item is Int {
    return reflection.isInstance(item, Int);
}

export interface Not extends AstNode {
    readonly $container: Brule | Not | RCrule | Rrule | Xor;
    inner: Not
}

export const Not = 'Not';

export function isNot(item: unknown): item is Not {
    return reflection.isInstance(item, Not);
}

export interface Nrule extends AstNode {
    readonly $container: Brule | Not | RCrule | Rrule | Xor;
    comp: string
    field: number | string
    val: Nval
}

export const Nrule = 'Nrule';

export function isNrule(item: unknown): item is Nrule {
    return reflection.isInstance(item, Nrule);
}

export interface Nval extends AstNode {
    readonly $container: Nrule;
    id?: Bid
    val?: Int
}

export const Nval = 'Nval';

export function isNval(item: unknown): item is Nval {
    return reflection.isInstance(item, Nval);
}

export interface Or extends AstNode {
    readonly $container: Filter | Group;
    inner: Array<And>
}

export const Or = 'Or';

export function isOr(item: unknown): item is Or {
    return reflection.isInstance(item, Or);
}

export interface Quantifier extends AstNode {
    readonly $container: RCrule | Rrule;
    lower?: SignedNat
    pivot?: SignedNat
    trend?: string
    upper?: SignedNat
}

export const Quantifier = 'Quantifier';

export function isQuantifier(item: unknown): item is Quantifier {
    return reflection.isInstance(item, Quantifier);
}

export interface RCrule extends AstNode {
    readonly $container: Brule | Not | RCrule | Rrule | Xor;
    pred: Group
    quant: Quantifier
}

export const RCrule = 'RCrule';

export function isRCrule(item: unknown): item is RCrule {
    return reflection.isInstance(item, RCrule);
}

export interface Rrule extends AstNode {
    readonly $container: Brule | Not | RCrule | Rrule | Xor;
    pred: Rpred
    quant: Quantifier
}

export const Rrule = 'Rrule';

export function isRrule(item: unknown): item is Rrule {
    return reflection.isInstance(item, Rrule);
}

export interface SignedNat extends AstNode {
    readonly $container: Quantifier;
    sign: boolean
    val: number
}

export const SignedNat = 'SignedNat';

export function isSignedNat(item: unknown): item is SignedNat {
    return reflection.isInstance(item, SignedNat);
}

export interface Trule extends AstNode {
    readonly $container: Brule | Not | RCrule | Rrule | Xor;
    comp: string
    field: number | string
    val: Tval
}

export const Trule = 'Trule';

export function isTrule(item: unknown): item is Trule {
    return reflection.isInstance(item, Trule);
}

export interface Tval extends AstNode {
    readonly $container: Trule;
    id?: Bid
    val?: string
}

export const Tval = 'Tval';

export function isTval(item: unknown): item is Tval {
    return reflection.isInstance(item, Tval);
}

export interface Xor extends AstNode {
    readonly $container: And;
    l: Not
    r?: Not
}

export const Xor = 'Xor';

export function isXor(item: unknown): item is Xor {
    return reflection.isInstance(item, Xor);
}

export type CustomPredicateAstType = 'And' | 'Bid' | 'Bind' | 'Binds' | 'Brule' | 'Filter' | 'Group' | 'Int' | 'Not' | 'Nrule' | 'Nval' | 'Or' | 'Predicate' | 'Quantifier' | 'RCrule' | 'Rpred' | 'Rrule' | 'Rule' | 'SignedNat' | 'Trule' | 'Tval' | 'Xor';

export type CustomPredicateAstReference = never;

export class CustomPredicateAstReflection implements AstReflection {

    getAllTypes(): string[] {
        return ['And', 'Bid', 'Bind', 'Binds', 'Brule', 'Filter', 'Group', 'Int', 'Not', 'Nrule', 'Nval', 'Or', 'Predicate', 'Quantifier', 'RCrule', 'Rpred', 'Rrule', 'Rule', 'SignedNat', 'Trule', 'Tval', 'Xor'];
    }

    isInstance(node: unknown, type: string): boolean {
        return isAstNode(node) && this.isSubtype(node.$type, type);
    }

    isSubtype(subtype: string, supertype: string): boolean {
        if (subtype === supertype) {
            return true;
        }
        switch (subtype) {
            case Bind: {
                return this.isSubtype(Binds, supertype);
            }
            case Brule:
            case Nrule:
            case RCrule:
            case Rrule:
            case Trule: {
                return this.isSubtype(Rule, supertype);
            }
            case Group: {
                return this.isSubtype(Not, supertype) || this.isSubtype(Rpred, supertype);
            }
            case Or: {
                return this.isSubtype(Predicate, supertype);
            }
            case Rule: {
                return this.isSubtype(Group, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(referenceId: CustomPredicateAstReference): string {
        switch (referenceId) {
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }

    getTypeMetaData(type: string): TypeMetaData {
        switch (type) {
            case 'And': {
                return {
                    name: 'And',
                    mandatory: [
                        { name: 'inner', type: 'array' }
                    ]
                };
            }
            case 'Bind': {
                return {
                    name: 'Bind',
                    mandatory: [
                        { name: 'fields', type: 'array' }
                    ]
                };
            }
            case 'Binds': {
                return {
                    name: 'Binds',
                    mandatory: [
                        { name: 'fields', type: 'array' }
                    ]
                };
            }
            case 'Filter': {
                return {
                    name: 'Filter',
                    mandatory: [
                        { name: 'rules', type: 'array' }
                    ]
                };
            }
            case 'Int': {
                return {
                    name: 'Int',
                    mandatory: [
                        { name: 'sign', type: 'boolean' }
                    ]
                };
            }
            case 'Or': {
                return {
                    name: 'Or',
                    mandatory: [
                        { name: 'inner', type: 'array' }
                    ]
                };
            }
            case 'SignedNat': {
                return {
                    name: 'SignedNat',
                    mandatory: [
                        { name: 'sign', type: 'boolean' }
                    ]
                };
            }
            default: {
                return {
                    name: type,
                    mandatory: []
                };
            }
        }
    }
}

export const reflection = new CustomPredicateAstReflection();
