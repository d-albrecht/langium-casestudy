Langium - Case Study
====================

This is a quick test to try to adapt some existing dsl-definition to the Langium framework.

## The dsl

The dsl I use here is given in form of a formal grammar.

```
Filter = _ f:Or _ {return 'return '+f+';';} / _ {return 'return true;';}
Or = h:And t:(_ ('|' '|'? / 'OR'i) _ And)* {return t.reduce((t,e) => t+'||'+e[3],h);}
And = h:Xor t:(_ ('&' '&'? / 'AND'i) _ Xor)* {return t.reduce((t,e) => t+'&&'+e[3],h);}
Xor = l:Not _ ('^' / 'XOR'i) _ r:Not {return l+'!='+r;} / Not
Not = ('!' / 'NOT'i) _ f:Not {return '!'+f;} / Group
Group = '(' _ f:Or _ ')' {return '('+f+')';} / Rule
Rule = tRule / nRule / rRule / rcRule / bRule
tRule = '[' f:Field? ']' _ n:[=!]e:[=~] _ v:tVal {return 't(o,'+f+','+v+','+(n=='=')+','+(e=='=')+')';}
tVal = v:String / b:bID {return 'i['+b+']';}
nRule = '{' f:Field '}' _ c:nComp _ v:nVal {return 'n(o,'+f+','+v+','+c+')';}
nComp = n:[!=]'=' {return '[true,'+(n=='=')+']';} / c:[<>]e:'='? {return '[false,'+(!!e)+','+(c=='<')+']';}
nVal = v:Int / b:bID {return 'parseInt(i['+b+'])';}
rRule = '<' _ q:Quantifier _ '>' _ p:rPred {return 'r(o,e,i,"+switch",'+q+',function(o,e,i){return '+p+';})';}
rPred = Group / '(' _ ')' {return 'true';}
Quantifier = '!' {return '[0]';} / '?' {return '[1]';}
	/ l:sNat _ '~' _ u:sNat {return '[2,'+l+','+u+']';}
	/ p:sNat _ t:[+-]? {return '[3,'+p+','+(t?(t=='+'?1:-1):0)+']';}
rcRule = '>' _ q: Quantifier _ '<' _ p:Group {return 'r(o,e,i,"allC",'+q+',function(o,e,i){return '+p+';})';}
bRule = b:Binds _ '~>' _ p:Group {return 'b(o,e,i,'+b+',function(o,e,i){return '+p+';})'}
Binds = '@@(' _ b:(Bind _)+ ')' {return '['+b.map((e) => e[0]).join(',')+']';} / b:Bind {return '['+b+']';}
Bind = '@' f:Field b:bID {return '['+b+','+f+']';}
bID "bind/bound id" = '#' b:Nat {return b;}
Nat "natural number" = [0-9]+ {return parseInt(text(),10);}
sNat "signed natural number" = n:'-'? v:Nat {return '['+v+','+!n+']';}
Int "integer" = '-'? Nat {return parseInt(text(),10);}
Field "field name" = [a-zA-Z0-9_ ]+ {return '"'+text()+'"';}
String "string" = '"' [^\\"]* '"' {return text();}
_ "spaces" = [ \t\n\r]*
```

The "re-write rules" (the parts in curly brackets) as well as other specific format-oddities (like the forward-slash for alternatives instead of the vertical bar symbol) are there because the current primary usage for this grammar is the JavaScript parser generator pegjs.org with its own somewhat special format-definitions.

### The context

In the project where this dsl is used, the web application loads information from csv files and parses them. Some fields in these files are references to other files. So, in a way these files create a database-like structure. The entries of these files are processed by the application in different ways. The point where the dsl comes into play is where the user of said tools wants to exclude specific entries from the processing. This could have been a great opportunity to use database-specific query languages like SQL, but that wasn't ideal for several reasons:
1. the data isn't stored in an actual database yet - rather in JS data types - and creating a database just for the filtering would have been a lot of extra work,
2. without a proper database using SQL for the filtering query would have meant to parse the SQL expresiion sort of manually and to adapt this language to the actual used data structures internally
3. the clientele of this web application isn't programmers but some diverse community, so while SQL is very close to natural language and hence easily comprehensible for non-programmers, the other reasons still made SQL not really appealing to use here.

So, the necessary filtering rules had to satisfy the following criteria:
- being specific to the actual data representation and the data in these files,
- being easy to grasp, and
- being parsable with a reasonable effort.

Therefore, the first version of this filtering expressions made use of simple text replacements to adapt a smaller but still very similar subset of the above syntax to a JS function format, that then got evaluated using essentially the JS-native eval-functionality. That of course meant that any input got passed down to the JS-environment without any checks and guards (effectively enabling code injection). Hence, the idea of pre-validation and pre-procesing got involved. At this point the above grammar was invented - being in a less feature-rich version. Still, the general work flow stayed the same. A parser validates the input and adapts the filtering expression to the data structures, but the generated string (representing a boolean predicate) is still wrapped in a JS-function format and evaluated using the same general principle.

That in turn meant that the grammar could natively support operations that require way more boiler-plate code in SQL like checking the quantity of some occasions happening for specific entries.

As the grammar constructs a string representation that is wrapped in some additional definitions and syntax, the parser uses some meta-variables and helper-functions that the parser itself doesn't have to worry about.

## Milestones

For adapting this dsl I see three main milestones to reach:
1. Having a version that checks the validity of input filter expressions. This will be a purely binary decision and not involve any external information, as well as none of the "re-write actions" present in the grammar. The generated AST-structure will not be of any particular interest here.
2. Having a version that performs the same (or similar) re-write rules and therefore generates a predicate definition that could replace the current one generated by pegjs.org. In particular, this version would still call the predefined helper-functions.
3. Integrate further information from the web application and in fact fully replace the current parser definition with a Langium-generated one. This version might make the helper-functions obsolete and itself define these pieces.

Milestone 3 might in practice not be in reach in the (time) scope I'm targetting here. The existing parser environment has evolved over years and hence is very specific to the web application. While both projects are based on JS/TS it could be doable, but that's not my personal goal for this case study. Rather, fully commiting to Langium and replacing the existing parser would be the goal for later in case Langium proved to be more suitable for the use case of this dsl.

Milestone 2 has several graduations itself. While the pegjs-parser doesn't construct an explicit AST, Langium does, and while the dsl isn't ambiguous, the expressions can get pretty complex. So, one might want to simplify the AST before focussing on any re-writes. With this being my first contact with Langium, I'm not sure yet, how easy working with the AST really is.
