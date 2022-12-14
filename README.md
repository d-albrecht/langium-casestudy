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

To mirror my dsl in Langium I started with the very fundamental building blocks like `Nat, Int, Field, String` and the first more complex definition of `Binds`. For `String` I just used the autogenerated terminal. The others I created myself or adapted existing ones. First observation: Langium apparently does a clear separation of Lexing and Parsing. My definition of `terminal FIELD: /[a-zA-Z0-9_ ]+/;` shadows any string of alphabetic characters. Hence, with this additional definition I had to comment out the definitions of `Person` and `Greeting` as Langium claimed they could no longer be the result of the parsing. That to me is a clear short coming. My point on this is that the grammar should dictate which tokens are consumed next, not a tokenizer that tries all existing terminals in a somewhat random order. Already tokenizing everything can consume characters that are mis-classified. Or, like it probably is the case in my example, I have to change the existing grammar to reflect the style of operation in Langium. Although my grammar was totally unambiguous in the first place. Any greedy parser with back-tracking should be able to parse this grammar, Langium apparently isn't without modification to either Langium itself or my grammar.

Second, while commenting out `Person` and `Greeting` - effectively deleting everything that made up the default generated language - several files refused to compile anymore. Eventually I figured out how to disable any code that I broke by commenting out entities that my grammar didn't need (although I clearly left boiler plate code in place that I only didn't remove because I don't know the ins and outs of Langium at this point, I could probably have just deleted whole files), but for a first time user it might be very unpleasant to experience errors that prevent compilation just because your dsl doesn't feature `Persons` and `Greetings`. Or the example language shouldn't come with too many features out of the box. Like the custom validator.

In the end, my attempt so far is compiling but isn't able to parse any valid input. And the error messages are really strange. What I get is `Expecting token of type 'NAT' but found '1234 '.` although my definition of natural numbers is `terminal NAT returns number: /[0-9]+/;` and at least the first four characters of `1234 ` should perfectly match my definition of NAT. I suspect that this again is based on the aforementioned Lexer/Parser separation. And to be honest, I don't really know how to ask for any help at this point. I haven't yet figured out how to best query/use the Langium Discussions page for specific problems.

Addendum 1: Perhaps fragments can solve some of my parsing errors as they themselves aren't consumed immediately as far as my understanding goes. Or the problem could be that you can't include definitions in other definitions?!?

Addendum 2: The Community in fact could help after all! The order of my terminal definitions didn't change the situation, but excluding digits from the head of field names did. That only changes the dsl somewhat. While in the exact use case of this dsl, digits should never occupy the initial position of field names, they definitely can be a part of a field name, so TECHNICALLY they could be at the head, too. That makes me wonder after all: will the dsl work at all, because SignedNat and Int effectively share the same definition. We will see soon, I guess.

## Step 2

With the first problems solved (as far as they were easily solvable that is), I went on and implemented the first rules. I encountered a problem with optional aspects when they again introduce ambiguity. I more and more feel like the Lexer is a disadvantage in Langium. Sure, tokenizing the input makes matching easier, but removes a lot of flexibility. dsls are meant to appeal to domain experts. Hence, you should be able to define dsls that are as close to the domain as possible. Having to introduce additional tokens to just make the grammar unambiguous because the parser isn't as powerful as it could be, seems wrong. But it is totally possible that my lack of experience painted by opinion of Langium is a too negative way and it is able to represent even (partially) ambiguous grammars. But then again, if you need to be a Langium expert to define advanced languages, then surely you could improve the UX of Langium itself, or couldn't you?

Again, ambiguity with the delimiters of the two recursive rules. They interfere with the numerical comparators less-than and greater-than.

And all textual boolean binary function names (and, or, xor, not) are no longer valid field names because the Lexer again classifies them before considering their context.

That said, Milestone 1 should be reached now. The next days I can try to manipulate the ast to produce the textual function definitions that the web application expects from the filtering expressions.

## Step 3

Next I will try to convert the input filtering expression (in dsl format) into a textual representation of a filter predicate (in JS format). Effectively, I will extend the parser I created into a transpiler.

Using the examples included in the Langium repo as a basis, it seems to be common practice to hook into the cli version of the dsl parser. That means, first I have to define a visitor-like type that turns the AST into a string again, and then define this cli hook. At this point, given the complexity of some filtering expressions, I think I should really do the transpiler way and directly write the converted filters into a separate file, if Langium/TS has these capabilities.

Well, apparently I can't change the generated file(s) without reading up on all the details of the process, so I will use the cli process that got created for the Person-Greeting-example and just replace the file content. Therefore, the hook was the easy part and is done.

The first question for the visitor is, how alternative definitions are represented in the AST and if I have to include additional fields in the dsl to differentiate alternatives. For example, how are the quantifiers '!' and '?' stored in the AST and do I have to include the parsed character to differentiate them?

Starting with the top most parser rules it was somewhat trivial to write visitor methods for them. Given that each filtering expression "starts" as an `Or` container, I could see the effects immediately and formatting Or, And, Xor, and Not were easy. But starting with `Not` I had alternative ways that the parser can go down, so here I had to figure out how the actual AST structure looks like. `Xor` has two fields `l` and `r` but both are of type Not. And the type Not doesn't offer ways to access the parsed expression in case the second way was taken (the expression being no `Not` in the first place). Do I have to manually type cast here?

Okay, so there are auto-generated `isType` functions for every type, **but they don't work every time**. It's possible to distinguish all the five concrete Rule-types, but detecting a `Not`-instance is almost always a false positive. I don't know why, but each time the parser found a Not expression, I have - according to the `isNot` function - a Not instance inside another Not instance, and in all other cases a Not instance without its (required) fields being set. These false positives can be prevented by checking `isNot(r) && (r as Not).inner` but then again, what does the `isNot` function if I have to manually check the fields for being set?

But with that implemented I can already output the general boolean structure with all concrete rules being replaced by placeholders at the moment. After some more implementation, all but the three most complex rules can be converted. The rest will have to wait for tomorrow.

As a conclusion for today: Langium is definitely preferable if your use case for the dsl is rather complex. For example, if you have to do several passes over the whole data structures. For this small project I'm working on here, Langium creates additional tasks that wouldn't be strictly necessary. pegjs for example can combine both grammar and converter/visitor in one definition, but therefore doesn't offer the option to do anything else with the constructed (implicit) AST. That means, that even if Milestone 3 is reachable with reasonable effort, I can't really see myself using Langium as a replacement for pegjs. That is, assuming that I could use the same dsl as with pegjs. The fact that the dsl itself had to change, too, is another argument against Langium in its current form.

## Step 4

Nothing worth mentioned happened this time, but the whole filtering expression should be converted to a JS fundtion using the cli tool now. The only thing I noticed was, that the `isBinds` predicate again didn't really detect any instance correctly. And a `Bind` has a field named `fields` that should only be present for `Binds`. Apparently, the generated AST is "merged" at some locations to account for the alternatives. But, I feel it's rather random at which positions this happens.

## Step 5

Mainly, to prove to myself that all my assumptions were actually true, I reworked large portions of my grammar again to get closer to the original dsl. As it turned out, I can express the exact same dsl in Langium, being it with more care for details. I left the next segment in place to visualize, at which points in the process I got stuck at some point. Because I still firmly believe that the user experience could be improved for users defining their (first) dsl, and these just were the issues I had.

To acchieve this, I defined explicit terminals for all of the following special charracters: `&, @, !, >, <, -, +, |, ~`. Then I explicitly defined sequences of special characters that can occur at some points: `&&, ~>, @@, ==, =~, >=, <=, !=, !~, ||`. Then, I defined several non-terminals that served as "terminal collections", like for example `Ncomp returns string: LT | GT | EQ | LTE | GTE | NE;`. They all needed an additional type annotation (for whatever reason). And using these terminal collections I was even able to solve the problem with the empty trend indicator. As it turns out, no terminal can capture the empty string (because they all get applied to your input regardless of context and an empty string could be place everywhere obviously), and no non-terminal rule (alternative) can parse to the start of another rule. But a typed terminal collection can in fact parse the empty string and be used elsewhere.

While re-working the dsl, I discovered that small details were still wrong (in addition to the modified syntax) and that the visitor didn't exactly match the pegjs re-write rules so I fixed these aspects as well. The only thing that would be necessary to prove that the Langium parser (in its Milestone 2 state) is now a drop-in replacement for the pegjs parser would be to modify the original project to use Langium, but I haven't figured out yet, how I use a Langium parser as a dependency for other projects.

## Step 6

At some point while doing the previous steps I tried to make use of the cross-reference feature in Langium, but I never managed to make it work in a way that it would automatically produce editor/cli parse errors if the referenced object wasn't created before. Rather, it produced NullPointers because if the reference isn't defined previously, it just can't be retrieved and I have to handle null values while traversing the tree. That sure can be one way to process these cases but if they don't automatically prevent the expression from being parsed (with a editor/cli parse error), I prefered to not use the cross-reference feature this time.

Instead, I just took a look at the validation approach that Langium offers (and that I disabled while deleting `person` and `greeting`). My use case was the same as with the cross-reference, detect references that won't work in production (retrieving a value that was never set). In production that will just fail to evaluate to a meanignful value (retrieving a not set value yields null and all comparators will just return some constant (mostly false) if one argument is null) but will never fail to process these cases. Hence, I decided to just add warnings where a retrieved value will never be there. Using the Langium validator approach has the advantage that it works just fine with scoping, as I have to define the validation rules myself and hence can respect scoping if I just take care of it while implementing the validator. A "global" cross-reference would just check if the id was bound anywhere, but in large expressions this definition of the id can easily be out of scope.

To do this I implemented another visitor. This time, most methods were just there to let the visitor traverse the AST and otherwise weren't doing much. But this visitor uses a context variable with all bound ids and the method to produce annotations as declared by the `CustomPredicateValidator`. The only two places where the visitor actually gets active, is while retrieving a value from the set of bound values, and at the definition site of bindings.

Because I wasn't very familiar with the principle of custom validators, the results of the validator were strange at first. What I didn't know was that the custom validator itself is able to traverse the AST and just ttriggered every time it detected a matching node in the tree. But validating bound ids in a scoped manner means that you always have to start at the root and traverse the tree yourself. And as the validator matched with every Or-node, and each Group-node contains an Or-node, every pair of brackets spawned another validator run. Meaning that when I enclosed an expression with a retrieved id that wasn't set in `n` sets of brackets, I got `n` warnings. And if I enclosed a legally retrieved id in another set of brackets, I got a warning because one parse started at the root, and one started inside (or out of scope of) the definition site. It might be a hack, but I fixed this by only starting the validation at Or-nodes that effectively have no parent node. But this might not be the best way to solve this.

What I discovered however, is that the validator wasn't running when launching the cli routine that I needed to generate the string representation in JS format. When I think of a compiler then error messages appear both in an ide and in the console. I get why it is not as trivial to include the generator code in the ide environment (where to put the generated output), but I don't get, why validation can only happen in ide-mode. But again, that can be a configuration problem due to my lack of familiarity with Langium.

And I again stumbled upon the `isType` methods, that don't work as expected. This time in the context of solving my duplicate warnings problem. I assumed that my visitor would process some parts several times because it mis-classified specific nodes. That in fact happened, but clearly wasn't the cause for the duplicate warnings. Still, I reordered some of my conditions to better catch specific types that otherwise could end up in the wrong visit-method. But I could also prove empirically and on a case by case basis (not generally) which order of conditionals I should use to prevent mis-classification. That's a shortcoming.

## Necessary Changes to the dsl

Clarification: I managed to acchieve feature- and syntax-parity with the original dsl, so all of the mentioned changes aren't necessary anymore. But they were at one point or another.

Here is a list of things that I had to change in the dsl to make it compatible with Langium. Some might just be due to my lack of experience:
- (Field names can't start with a digit anymore.) (Field names can't be actual numbers.) Field names were the root cause for several problems while translating the dsl to Langium. First, the generic definition clashed with the definition of NAT, then - with the help of the community - I had a version that allowed numbers at the head of the field name, but not the whole field name being an actual number. Finally, I replaced any reference to `Field` with `Field | NAT` which enabled actual numbers at the position of a field name. With certain drawbacks: (a) field names will be parsed if they are numbers resulting in leading zeros being stripped, (b) for numbers larger than the JS equivalent of Java's MAX_INTEGER, the parsing might yield strange values, and (c) the AST can have number types (or container) where semantically there should be a string type (or container).
- The quantifier variant with a indicated trend needed a trend for an exact match (aka for no trend), because otherwise the trend itself could result in the empty string and that's a problem for Langium.
- The comparators needed to be split into three terminals because of ambiguity.
- The recursive rules needed a new type of delimiters because otherwise I couldn't use "<" and ">" to compare numerical fields
- "and", "or", "xor", "not" are no valid field names.

## Conclusion

Some final words:
- The parts that worked as expected are great! A single definition is sufficient to generate types and a functioning parser. Most other compilers would have this split into several locations.
- But the parser is limiting itself. If you have one terminal that can be used in several contexts you either have to change the language you're translating, or you have to change the grammar just to appeal to Langium and have to handle the mess when you ultimately travers the AST. At first this might seem not related, but [this video](https://www.youtube.com/watch?v=6qzWm_eoUXM) shows how an in-place sorting algorithm was implemented in a purely immutable language. In this case, sorting a list that isn't referenced elsewhere is fast (because under the hood, the data structures are mutated), sorting a list that is referenced elsewhere will be slower (either because the runtime has to do a deep-copy first or fallback to slower algorithms). But the same applies in both cases, for ROC and for Langium, the internals shouldn't (too much) affect the outer appearence/behavior. And if the current lexer can't do the task, then perhaps it needs to be replaced.
- A good example for why the lexer is too "narrow-minded": take (almost) any natural language, where the same word can be used in several contexts. In English for example, words like "when" and "where" can start a (temporal or spacial) sub-clause ("I like parks where it isn't too loud, so that I can relax"), or they can be used to start a question ("When do we meet?"). If you wanted to write a grammar for natural languages, you couldn't limit words to one meaning either, just because that is easier for the lexer. But at the same time the grammar has to still be maintainable, so using alternatives in too many places will cause the language to be a legacy language very soon as nobody wants to touch it again.

## Possible improvements

Thinking further about Langium made me realize a few things about my dsl and Langium in general:
- Except for the modification regarding the trend-syntax, all other modifications should not be necessary. But, they will require some (excessive) manual work. First of all you had to define all characters and character sequences that can come up in different contexts as explicit and singular terminals. For example, I would need a terminal definition `LESSTHAN: /</;`. Then you would have to use this definition everywhere you need this terminal and add a `[x] | LESSTHAN` everywhere the terminal is also an option (for me, that would mean to add this as a numerical comparator option). For characters or character sequences that are legal prefixes of other terminals, you need to take care of the order in which you define the terminals. That all is no complex task, but a tedious one. Ideally, you needed a dsl (or otherwise a program) that translated unambiguous but not fitting grammars into Langium-compatible ones.
- The problem with the trend make me wonder what principles are behind the parser. On the one hand, it is greedy in the way that if it detects one terminal, it will never second-guess its decision and process the rules in a strict order. On the other hand Langum complains about alternatives that are ambiguous and terminals that can be the empty string. Either, Langium should be greedy and just accept the first successful parsing path it finds, then ambiguous alternatives would not pose a problem, if the first of the ambiguous fits, it would be chosen, if it wasn't the next one would get tested. Or, Langium should be strictly not greedy and only parser fully unambiguous grammars. But the latter really is a bad choice because composing a truly unambiguous grammar can be a huge task.
- The documentation is a bit lacking in the usage part of the already parsed dsl. At least give some hints to what to do with the dsl (before version 1.0).
- Can VSCode have the capabilities to build/compile a Langium project? I had to constantly use the terminal for the actual compilation.
- The default folder structure is a bit weird. Why is the langage definition under language-server when the server is only one of two use cases. Referencing the language-server files from within the cli folder doesn't feel right.
- The alternatives should be made type-safe in Langium somehow. If type/rule `A` contains an instance of `B`, but `B` is described by the definition `[some actual definition] | C`, then typing the instance of `B` in `A` as `B` is misleading. It should be typed as `B | C` assuming `C` is an actual definition itself. For example, the way that the AST is constructed, the fields `l` and `r` of my `Xor` definition should have the type `Not | Group | Trule | Nrule | Brule | Rrule | RCrule`. Because all those can effectively be at this positions. And of course, the `isType` functions should work more reliable.
- error messages should be clearer. See my problems in step 1. If the error message effectively says: `x is not of type y`, although the type definition of `y` perfectly describes `x`, then the error happens because `x` got assigned another type, not that `x` doesn't match the definition of `y`!
- Terminals are getting parsed/tried in the order they are defined, right? That's the reason, why `<=` would never be parsable if defined after `<`, as the latter would capture all less-than characters. If I define `NAT: /0|[1-9][0-9]*/` before my original definition of `field: /[a-zA-Z0-9_ ]/`, why are `NAT`s still captured by `FIELD` first? That doesn't make any sense to me.
- cross references can produce null values but - in my case - never let the parsing fail, as suggested in the documentation
- how to enable validation in cli-mode?
