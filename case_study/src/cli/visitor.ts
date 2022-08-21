import { And, Bid, Bind, Binds, Brule, Group, Int, isBind, isBrule, isGroup, isNot, isNrule, isRCrule, isRrule, isTrule, Not, Nrule, Or, Predicate, Quantifier, RCrule, Rrule, SignedNat, Trule, Xor } from '../language-server/generated/ast';

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
    let field = "\"" + t.field.toString() + "\"";
    let val = (t.val.val) ? "\"" + t.val.val + "\"" : visitBid(t.val.id as Bid, false);
    let comp = visitTcomp(t.comp);
    return "t(o," + field + "," + val + "," + comp + ")";
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

function visitNrule(n: Nrule): string {
    let field = "\"" + n.field.toString() + "\"";
    let val = (n.val.val) ? visitInt(n.val.val) : visitBid(n.val.id as Bid, true);
    let comp = visitNcomp(n.comp);
    return "n(o," + field + "," + val + "," + comp + ")";
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

function visitBrule(b: Brule): string {
    let binds = visitBinds(b.binds);
    let p = visitRules(b.group);
    return "b(o,e,i," + binds + ",function(o,e,i){return " + p + ";})";
}

function visitBinds(b: Binds): string {
    if (isBind(b))
        return "[" + visitBind(b) + "]";
    return "[" + b.fields.map(visitBind).join(",") + "]";
}

function visitBind(b: Bind): string {
    return "[" + b.id.id + ",\"" + b.field.toString() + "\"]";
}

function visitRrule(r: Rrule): string {
    let q = visitQuantifier(r.quant);
    let p = visitRules(r.pred);
    return "r(o,e,i,\"+switch\"," + q + ",function(o,e,i){return " + p + ";})";
}

function visitRCrule(r: RCrule): string {
    let q = visitQuantifier(r.quant);
    let p = visitRules(r.pred);
    return "r(o,e,i,\"allC\"," + q + ",function(o,e,i){return " + p + ";})";
}

function visitQuantifier(q: Quantifier): string {
    return (q.f) ? ((q.f == "!") ? "[0]" : "[1]") : (
        (q.lower) ? ("[2," + visitInt(q.lower) + "," + visitInt(q.upper!) + "]") :
        ("[3," + visitInt(q.pivot!) + "," + visitTrend(q.trend!) + "]")
    );
}

function visitTrend(t: string): string {
    switch (t) {
        case '+':
            return "1";
        case '-':
            return "-1";
        case '.':
            return "0";
        default:
            return "error";
    }
}

function visitInt(int: Int | SignedNat): string {
    return ((int.sign) ? "-" : "") + int.val.toString()
}

function visitBid(bid: Bid, num: boolean): string {
    if (num) {
        return "parseInt(i[" + bid.id.toString() + "])";
    } else {
        return "i[" + bid.id.toString() + "]";
    }
}