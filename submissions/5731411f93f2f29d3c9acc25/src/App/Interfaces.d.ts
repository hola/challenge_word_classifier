import {LoDashStatic} from "lodash";

export interface ILodash extends LoDashStatic {
    sortedUniq(data: any);
}

export interface IWordDictionaries {
    [key: string]: IWordDictionary;
}

export interface IWordDictionary {
    name: string;
    path: string;
    dictionary: string[];
    rule: IWordDictionaryRule;
    getData?: Function;
}

export interface IWordDictionaryRule {
    firstIndex: number;
    charCount: number;
}

export interface IPackedDictionaryRule {
    firstIndex: number;
    charCount: number;
}

export interface IPackedDictionaries {
    [key: string]: IPackedDictionary;
}

export interface IPackedDictionary {
    rule: IPackedDictionaryRule,
    data: string;
}

export interface IDictionaryTrees {
    [key: string]: IDictionaryTree;
}

export interface IDictionaryTree {
    rootNode: ITreeDictionary;
    rule: IPackedDictionaryRule;
}

export interface ITreeDictionary {
    $?: string;
    T?: boolean;
}

export interface IPackedData {
    dictionaries: IPackedDictionaries;
}