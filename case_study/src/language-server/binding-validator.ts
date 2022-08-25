import { ValidationAcceptor } from "langium";
import { And, Bind, Binds, Brule, Group, isBind, isBrule, isGroup, isNot, isNrule, isRCrule, isRrule, isTrule, Not, Nrule, Nval, Or, Predicate, RCrule, Rrule, Trule, Tval, Xor } from "./generated/ast";

class ValidationContext {
    constructor(accept: ValidationAcceptor, bindings?: boolean[]) {
        this.accept = accept;
        if (bindings !== undefined)
            this.bindings = bindings;
        else
            this.bindings = [];
    }
    bindings: boolean[];
    accept: ValidationAcceptor;
    clone(): ValidationContext {
        return new ValidationContext(this.accept, this.bindings.slice())
    }
}

export function validate(predicate: Predicate, accept: ValidationAcceptor): void {
    if (!predicate.$container.$container) {
        let ctx = new ValidationContext(accept);
        visitOr(predicate, ctx);
    }
}

function visitOr(or: Or, ctx: ValidationContext): void {
    or.inner.forEach(i => visitAnd(i, ctx));
}

function visitAnd(and: And, ctx: ValidationContext): void {
    and.inner.forEach(i => visitXor(i, ctx));
}

function visitXor(xor: Xor, ctx: ValidationContext): void {
    visitRules(xor.l, ctx);
    if (xor.r) {
        visitRules(xor.r, ctx);
    }
}

function visitRules(r: Not | Group, ctx: ValidationContext): void {
    if (isTrule(r))
        visitTrule(r as Trule, ctx);
    else if (isNrule(r))
        visitNrule(r as Nrule, ctx);
    else if (isBrule(r))
        visitBrule(r as Brule, ctx);
    else if (isRrule(r))
        visitRrule(r as Rrule, ctx);
    else if (isRCrule(r))
        visitRCrule(r as RCrule, ctx);
    else if (isGroup(r) && (r as Group).rule)
        visitGroup(r as Group, ctx);
    else if (isNot(r) && (r as Not).inner)
        visitNot(r as Not, ctx);
}

function visitNot(not: Not, ctx: ValidationContext): void {
    visitRules(not.inner, ctx);
}

function visitGroup(group: Group, ctx:ValidationContext): void {
    visitOr(group.rule, ctx);
}

function visitTrule(t: Trule, ctx: ValidationContext): void {
    visitTval(t.val, ctx);
}

function visitTval(val: Tval, ctx: ValidationContext): void {
    if (val.id && !ctx.bindings[parseInt(val.id.id, 10)]) {
        ctx.accept("warning", "Id '" + parseInt(val.id.id, 10) + "' isn't bound to anything at this point in time!", { node: val, property: 'id' });
    }
}

function visitNrule(n: Nrule, ctx: ValidationContext): void {
    visitNval(n.val, ctx);
}

function visitNval(val: Nval, ctx: ValidationContext): void {
    if (val.id && !ctx.bindings[parseInt(val.id.id, 10)]) {
        ctx.accept("warning", "Id '" + parseInt(val.id.id, 10) + "' isn't bound to anything at this point in time!", { node: val, property: 'id' });
    }
}

function visitBrule(b: Brule, ctx: ValidationContext): void {
    let scope = ctx.clone();
    visitBinds(b.let, scope)
    visitRules(b.body, scope);
}

function visitBinds(bind: Bind | Binds, ctx: ValidationContext): void {
    if (isBind(bind)) {
        //ctx.accept("info", "Id '" + parseInt((bind as Bind).id.id, 10) + "' set here!", { node: bind });
        ctx.bindings[parseInt((bind as Bind).id.id, 10)] = true;
    } else {
        (bind as Binds).bindings.forEach(b => visitBinds(b, ctx));
    }
}

function visitRrule(r: Rrule, ctx: ValidationContext): void {
    visitRules(r.pred, ctx);
}

function visitRCrule(r: RCrule, ctx: ValidationContext): void {
    visitRules(r.pred, ctx);
}