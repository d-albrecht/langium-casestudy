/******************************************************************************
 * This file was generated by langium-cli 0.4.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { LangiumGeneratedServices, LangiumGeneratedSharedServices, LangiumSharedServices, LangiumServices, LanguageMetaData, Module } from 'langium';
import { CustomPredicateAstReflection } from './ast';
import { CustomPredicateGrammar } from './grammar';

export const CustomPredicateLanguageMetaData: LanguageMetaData = {
    languageId: 'custom-predicate',
    fileExtensions: ['.pred'],
    caseInsensitive: false
};

export const CustomPredicateGeneratedSharedModule: Module<LangiumSharedServices, LangiumGeneratedSharedServices> = {
    AstReflection: () => new CustomPredicateAstReflection()
};

export const CustomPredicateGeneratedModule: Module<LangiumServices, LangiumGeneratedServices> = {
    Grammar: () => CustomPredicateGrammar(),
    LanguageMetaData: () => CustomPredicateLanguageMetaData,
    parser: {}
};