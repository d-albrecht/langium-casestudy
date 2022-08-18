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

## First impressions of Languium

Langium has some features that immediately make the generation of a parser way easier:
- Langium has hidden terminals that allow me to completely ignore certain characters like white-spaces. In the current pegjs-powered parser I have to add potential white-spaces at every possible position in order to allow them there. In Langium you can "enable" such amenities with a global definition.
- In the same way are comments trivial. The pegjs-powered parser never got any comment-definitions because similarly to white-spaces you have to expliitly allow them anywhere they could be placed. For Langium all you need is to choose some opening and closing delimiters and add a global definition and comments are handled.
- Langium comes with some validation features out of the box. Namely the cross-reference capability. The pegjs-powered parser can save information similarly to a let-expresion in Lisp. But if the filtering expression recalls some of these stored values, the parser will not check if the used index is bound to anything at this point. And while the storage is meant to be scoped and I don't know yet if Langium can accomplish this, the framework can at least check, whether this index is bound somewhere at all, though possibly out of scope.

## Step 1

To mirror my dsl in Langium I started with the very fundamental building blocks like `Nat, Int, Field, String` and the first more complex definition of `Binds`. For `String` I just used the autogenerated terminal. The others I created myself or adapted existing ones. First observation: Langium apparently does a clear separation of Lexing and Parsing. My definition of `terminal FIELD: /[a-zA-Z0-9_ ]+/;` shadows any string of alphabetic characters. Hence, with this additional definition I had to comment out the definitions of `Person` and `Greeting` as Langium claimed they could no longer be the result of the parsing. That to me is a clear short coming. My point on this is that the grammar should dictate which tokens are consumed next not a tokenizer that tries all existing terminals in a somewhat random order. Already tokenizing everything can consume characters that are mis-classified. Or, like it probably is the case in my example, I have to change the existing grammar to reflect the style of operation in Langium. Although my grammar was totally unambiguous in the first place. Any greedy parser with back-tracking should be able to parse this grammar, Langium apparently isn't without modification to either Langium itself or my grammar.

Second, while commenting out `Person` and `Greeting` - effectively deleting everything that made up the default generated language - several files refused to compile anymore. Eventually I figured out how to disable any code that I broke by commenting out entities that my grammar didn't need (although I clearly left boiler plate code in place that I only didn't remove because I don't know the ins and outs of Langium at this point, I could probably have just deleted whole files), but for a first time user it might be very unpleasant to experience errors that prevent compilation just because your dsl doesn't feature `Persons` and `Greetings`. Or the example language shouldn't come with too many features out of the box. Like the custom validator.

In the end, my attempt so far is compiling but isn't able to parse any valid input. And the error messages are really strange. What I get is `Expecting token of type 'NAT' but found '1234 '.` although my definition of natural numbers is `terminal NAT returns number: /[0-9]+/;` and at least the first four characters of `1234 ` should perfectly match my definition of NAT. I suspect that this again is based on the aforementioned Lexer/Parser separation. And to be honest, I don't really know how to ask for any help at this point. I haven't yet figured out how to best query/use the Langium Discussions page for specific problems.

Addendum 1: Perhaps fragments can solve some of my parsing errors as they themselves aren't consumed immediately as far as my understanding goes. Or the problem could be that you can't include definitions in other definitions?!?

Addendum 2: The Community could help after all! The order of my terminal definitions didn't change the situation, but excluding digits from the head of field names did. That only changes the dsl somewhat. While in the exact use case of this dsl, digits should never occupy the initial position of field names, they definitely can be a part of a field name, so TECHNICALLY they could be at the head, too. That makes me wonder after all: will the dsl work at all, because SignedNat and Int effectively share the same definition. We will see soon, I guess.
