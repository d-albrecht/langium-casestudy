import { And, Bind, Binds, Brule, Group, Int, isBind, isBrule, isGroup, isNot, isNrule, isRCrule, isRrule, isTrule, Not, Nrule, Nval, Or, Predicate, Quantifier, RCrule, Rrule, Trule, Tval, Xor } from '../language-server/generated/ast';

export function visitFilter(filter: Predicate): string {
    //this is a slight adaption of the actual format because Langium accepts several rules per file
    return "(o,i,e) => { return " + visitOr(filter) + " };";
}

function visitOr(or: Or): string {
    return or.inner.map(visitAnd).join(" || ");
}

function visitAnd(and: And): string {
    return and.inner.map(visitXor).join(" && ");
}

function visitXor(xor: Xor): string {
    if (xor.r) {
        return visitRules(xor.l) + " != " + visitRules(xor.r);
    } else {
        return visitRules(xor.l);
    }
}

function visitRules(r: Not | Group): string {
    if (isNot(r) && (r as Not).inner)
        return visitNot(r as Not);
    if (isGroup(r) && (r as Group).rule)
        return visitGroup(r as Group);
    if (isTrule(r))
        return visitTrule(r as Trule);
    if (isNrule(r))
        return visitNrule(r as Nrule);
    if (isBrule(r))
        return visitBrule(r as Brule);
    if (isRrule(r))
        return visitRrule(r as Rrule);
    if (isRCrule(r))
        return visitRCrule(r as RCrule);
    return "true";
}

function visitNot(not: Not): string {
    return "!" + visitRules(not.inner);
}

function visitGroup(group: Group): string {
    return "("+ visitOr(group.rule) +")";
}

function visitTrule(t: Trule): string {
    let field = (t.field) ? "\"" + t.field + "\"" : "null";
    return "t(o," + field + "," + visitTval(t.val) + "," + visitTcomp(t.comp) + ")";
}

function visitTcomp(comp: string): string {
    switch (comp) {
        case '==':
            return "true,true";
        case '!=':
            return "false,true";
        case '=~':
            return "true,false";
        case '!~':
            return "false,false";
        default:
            return "error";
    }
}

function visitTval(val: Tval): string {
    if (val.id)
    return "i[" + parseInt(val.id.id, 10).toString() + "]";
    return "\"" + val.val + "\"";
}

function visitNrule(n: Nrule): string {
    return "n(o,\"" + n.field + "\"," + visitNval(n.val) + "," + visitNcomp(n.comp) + ")";
}

function visitNcomp(comp: string): string {
    switch (comp) {
        case '==':
            return "[true,true]";
        case '!=':
            return "[true,false]";
        case '<':
            return "[false,false,true]";
        case '>':
            return "[false,false,false]";
        case '<=':
            return "[false,true,true]";
        case '>=':
            return "[false,true,false]";
        default:
            return "[error]";
    }
}

function visitNval(val: Nval): string {
    if (val.id)
    return "parseInt(i[" + parseInt(val.id.id, 10).toString() + "])";
    return visitInt(val.val!);
}

function visitBrule(b: Brule): string {
    let binds = visitBinds(b.let);
    let p = visitRules(b.body);
    return "b(o,e,i," + binds + ",function(o,e,i){return " + p + ";})";
}

function visitBinds(b: Binds): string {
    if (isBind(b))
        return "[" + visitBind(b) + "]";
    return "[" + b.bindings.map(visitBind).join(",") + "]";
}

function visitBind(b: Bind): string {
    return "[" + parseInt(b.id.id, 10).toString() + ",\"" + b.field + "\"]";
}

function visitRrule(r: Rrule): string {
    let q = visitQuantifier(r.quant);
    // the empty bracket case is handled by visitRules
    let p = visitRules(r.pred);
    return "r(o,e,i,\"+switch\"," + q + ",function(o,e,i){return " + p + ";})";
}

function visitRCrule(r: RCrule): string {
    let q = visitQuantifier(r.quant);
    let p = visitRules(r.pred);
    return "r(o,e,i,\"allC\"," + q + ",function(o,e,i){return " + p + ";})";
}

function visitQuantifier(q: Quantifier): string {
    // format ints as array [num, sign]
    return (q.fun) ? ((q.fun == "!") ? "[0]" : "[1]") : (
        (q.range) ? ("[2," + visitSignedNat(q.lower!) + "," + visitSignedNat(q.upper!) + "]") :
        ("[3," + visitSignedNat(q.pivot!) + "," + visitTrend(q.trend!) + "]")
    );
}

function visitTrend(t: string): string {
    switch (t) {
        case '+':
            return "1";
        case '-':
            return "-1";
        case '.':
        default:
            return "0";
    }
}

function visitInt(int: Int): string {
    return ((int.sign) ? "-" : "") + parseInt(int.val, 10).toString();
}

function visitSignedNat(int: Int): string {
    return "[" + parseInt(int.val, 10).toString() +  "," + (!int.sign) + "]";
}
