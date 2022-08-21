grammar CustomPredicate

entry Filter:
    (rules+=Predicate)*;

// just to have a nice entry point here, semantically it's a simple alias
Predicate: Or;

Or: inner+=And (('|' '|'? | OR) inner+=And)*;
And: inner+=Xor (('&' '&'? | AND) inner+=Xor)*;
Xor: l=Not (('^' | XOR) r=Not)?;
Not: ('!' | NOT) inner=Not | Group;
Group: '(' rule=Or ')' | Rule;
Rule: Trule | Nrule | Brule | Rrule | RCrule;

Trule: '[' field=(FIELD | NAT) ']' comp=(TCOMP | COMP) val=Tval;
Nrule: '{' field=(FIELD | NAT) '}' comp=(LTE | GTE | COMP) val=Nval;

Brule: binds=Binds '~>' group=Group;
Rrule: '/' quant=Quantifier '/' pred=Rpred;
RCrule: '\' quant=Quantifier '\' pred=Group;

Rpred: Group | '(' ')';
Tval: val=STRING | id=Bid;
Nval: val=Int | id=Bid;
//alternatively use the TREND definition instead of lte/gte
Quantifier: f='!' | f='?' | lower=SignedNat '~' upper=SignedNat | pivot=SignedNat trend=TREND;
Binds: '@@(' (fields+=Bind)+ ')' | Bind;
Bind: '@' field=(FIELD | NAT) id=Bid;
Bid: '#' id=NAT;

SignedNat: (sign?='-')? val=NAT;
Int: (sign?='-')? val=NAT;
//terminal ID: /[_a-zA-Z][\w_]*/;

terminal NOT: /[nN][oO][tT]/;
terminal XOR: /[xX][oO][rR]/;
terminal AND: /[aA][nN][dD]/;
terminal OR: /[oO][rR]/;
terminal TCOMP: /[!=]~/;
terminal LTE: /<(=)?/;
terminal GTE: />(=)?/;
terminal COMP: /[!=]=/;
//terminal INT returns number: /-?[0-9]+/;
// I had to change my definition of field to exclude the first char being a number to avoid "overlapping terminals",
// but I'm not sure if this would always work in the context of this dsl, it's possible that I get a number at pos 0
//terminal FIELD: /[a-zA-Z0-9_ ]+/;
terminal FIELD: /[a-zA-Z_][a-zA-Z0-9_ ]*|([0-9]+[a-zA-Z_]+)+[0-9]*/;
terminal NAT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;
terminal TREND: /[+-.]/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
