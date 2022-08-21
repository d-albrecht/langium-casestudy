grammar CustomPredicate

entry Filter:
    (rules+=Predicate)*;

// just to have a nice entry point here, semantically it's a simple alias
Predicate: Or;

Or: inner+=And ((PIPE | PP | OR) inner+=And)*;
And: inner+=Xor ((AMP | AMS | AND) inner+=Xor)*;
Xor: l=Not (('^' | XOR) r=Not)?;
Not: (BANG | NOT) inner=Not | Group;
Group: '(' rule=Or ')' | Rule;
Rule: Trule | Nrule | RCrule | Rrule | Brule;

Trule: '[' field=Field ']' comp=Tcomp val=Tval;
Tval: val=STRING | id=Bid;

Nrule: '{' field=Field '}' comp=Ncomp val=Nval;
Nval: val=Int | id=Bid;

RCrule: GT quant=Quantifier LT pred=Group;
Quantifier: fun=BANG | fun='?' | lower=Int TILDE upper=Int | pivot=Int trend=Trend;

Rrule: LT quant=Quantifier GT pred=Rpred;
Rpred: Group | '(' ')';

Brule: let=Binds ARW body=Group;
Binds: ATT '(' (bindings+=Bind)+ ')' | Bind;
Bind: AT field=Field id=Bid;
Bid: '#' id=NAT;

Int: (sign?=MINUS)? val=Nat;

// terminal collections
Field returns string: FIELD | AND | NOT | OR | XOR | NAT | NUM;
Nat returns number: NAT | NUM; // for numbers in NUM-format, all Nats have to be processed with parseInt(Nat).toString() to prevent octal parsing
Ncomp returns string: LT | GT | EQ | LTE | GTE | NE;
Tcomp returns string: EQ | FZY | NE | NFZ;
Trend returns string: (MINUS | PLUS)?;

// two special characters
terminal AMS: /&&/;
terminal ARW: /~>/;
terminal ATT: /@@/;
terminal EQ: /==/;
terminal FZY: /=~/;
terminal GTE: />=/;
terminal LTE: /<=/;
terminal NE: /!=/;
terminal NFZ: /!~/;
terminal PP: /\|\|/;

// one special character
// all remaining characters never occur in any combinations, therefore they are fine as parts of non-terminal definitions
terminal AMP: /&/;
terminal AT: /@/;
terminal BANG: /!/;
terminal GT: />/;
terminal LT: /</;
terminal MINUS: /-/;
terminal PLUS: /\+/;
terminal PIPE: /\|/;
terminal TILDE: /~/;

// textual boolean operators
terminal AND: /[aA][nN][dD]/;
terminal NOT: /[nN][oO][tT]/;
terminal OR: /[oO][rR]/;
terminal XOR: /[xX][oO][rR]/;

// complex terminals
terminal STRING: /"[^"]*"|'[^']*'/;
terminal NUM: /0[0-9]+/; // collection of numbers that would be altered if parsed normally
terminal NAT: /0|[1-9][0-9]*/;
terminal FIELD: /[a-zA-Z_][a-zA-Z0-9_ ]*|([0-9]+[a-zA-Z_]+)+[0-9]*/;

// I had to change my definition of field to prevent conflicts with the NAT and NUM definitions.
// In case a field has a "numerical name", this will be handled by a terminal collection definition above.
// terminal FIELD: /[a-zA-Z0-9_ ]+/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
