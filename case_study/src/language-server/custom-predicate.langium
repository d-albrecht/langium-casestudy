grammar CustomPredicate

entry Model:
    (binds+=Binds)*;
/*
Person:
    'person' name=ID;

Greeting:
    'Hello' person=[Person:ID] '!';
*/
Binds: '@@(' (fields+=Bind)+ ')' | Bind;
Bind: '@' field=FIELD id=Bid;
Bid: '#' id=NAT;
//SignedNat: (sign?='-')? val=NAT;

//terminal ID: /[_a-zA-Z][\w_]*/;

terminal NAT returns number: /[0-9]+/;
//terminal INT returns number: /-?[0-9]+/;
terminal FIELD: /[a-zA-Z0-9_ ]+/;
//terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
